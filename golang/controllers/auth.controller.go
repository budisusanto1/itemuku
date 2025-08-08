package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wpcodevo/golang-gorm-postgres/initializers"
	"github.com/wpcodevo/golang-gorm-postgres/models"
	"github.com/wpcodevo/golang-gorm-postgres/utils"
	"gorm.io/gorm"
)

type AuthController struct {
	DB *gorm.DB
}

func NewAuthController(DB *gorm.DB) AuthController {
	return AuthController{DB}
}

// SignUp User
func (ac *AuthController) SignUpUser(ctx *gin.Context) {
	var payload *models.SignUpInput

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	if payload.Password != payload.PasswordConfirmation {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Passwords do not match"})
		return
	}

	HashedPassword, err := utils.CryptPassword(payload.Password)
	if err != nil {
		ctx.JSON(http.StatusBadGateway, gin.H{"status": "error", "message": err.Error()})
		return
	}

	now := time.Now()
	var uuid string
	uuid, err = utils.NewID()
	if err != nil {
		ctx.JSON(http.StatusBadGateway, gin.H{"status": "error", "message": "Could not generate user ID"})
		return
	}
	newUser := models.User{
		Userid:       uuid,
		Name:         payload.Name,
		Email:        strings.ToLower(payload.Email),
		PasswordHash: HashedPassword,
		RoleID:       2,
		CreatedAt:    now,
	}
	newUser.Username = newUser.Email
	result := ac.DB.Create(&newUser)

	if result.Error != nil && strings.Contains(result.Error.Error(), "duplicate key value violates unique") {
		ctx.JSON(http.StatusConflict, gin.H{"status": "fail", "message": "User with that email already exists"})
		return
	} else if result.Error != nil {
		ctx.JSON(http.StatusBadGateway, gin.H{"status": "error", "message": "Something bad happened"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data": gin.H{
			"user": gin.H{
				"userid": newUser.Userid,
				"name":   newUser.Name,
				"email":  newUser.Email,
				"role":   newUser.RoleID,
				"avatar": newUser.Avatar,
			},
		},
	})
}

func (ac *AuthController) SignInUser(ctx *gin.Context) {
	var payload *models.SignInInput

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	// var user models.User
	// result := ac.DB.First(&user, "email = ?", strings.ToLower(payload.Email))
	// if result.Error != nil {
	// 	ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
	// 	return
	// }
	sql := "SELECT * FROM users WHERE email='" + strings.ToLower(payload.Email) + "' and status in (0, 1) LIMIT 1"

	rows, err := utils.SelectQuery(sql)
	if err != nil {
		log.Println("Query error:", err)
		return
	}
	if len(rows) == 0 {
		log.Println("Tidak ada data ditemukan.")
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}
	// log.Println("DEBUG:", rows)

	userarr := rows[0] // Ambil baris pertama sebagai user
	// for _, row := range rows {
	// 	// log.Printf("UserID: %v, Name: %v", row["userid"], row["name"])
	// }
	log.Println((utils.VerifyPasswordDB(userarr["userid"].(string), payload.Password)))
	if !(utils.VerifyPasswordDB(userarr["userid"].(string), payload.Password)) {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Invalid email or Password"})
		return
	}

	config, _ := initializers.LoadConfig(".")

	access_token, err := utils.CreateToken(config.AccessTokenExpiresIn, userarr["userid"], config.AccessTokenPrivateKey)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	refresh_token, err := utils.CreateToken(config.RefreshTokenExpiresIn, userarr["userid"], config.RefreshTokenPrivateKey)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	ctx.SetCookie("access_token", access_token, config.AccessTokenMaxAge*60, "/", "localhost", false, true)
	ctx.SetCookie("refresh_token", refresh_token, config.RefreshTokenMaxAge*60, "/", "localhost", false, true)
	ctx.SetCookie("logged_in", "true", config.AccessTokenMaxAge*60, "/", "localhost", false, false)

	ctx.JSON(http.StatusCreated, gin.H{
		"status":        "success",
		"access_token":  access_token,
		"refresh_token": refresh_token,
		"message":       "User signed in successfully",
		"user": gin.H{
			"userid": userarr["userid"].(string),
			"name":   userarr["name"].(string),
			"email":  userarr["email"].(string),
			"role":   userarr["role_id"],
			"avatar": userarr["avatar"].(string),
		},
	})

}

// Refresh Access Token
func (ac *AuthController) RefreshAccessToken(ctx *gin.Context) {
	message := "could not refresh access token"

	cookie, err := ctx.Cookie("refresh_token")

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "fail", "message": message})
		return
	}

	config, _ := initializers.LoadConfig(".")

	sub, err := utils.ValidateToken(cookie, config.RefreshTokenPublicKey)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	var user models.User
	result := ac.DB.First(&user, "id = ?", fmt.Sprint(sub))
	if result.Error != nil {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "fail", "message": "the user belonging to this token no logger exists"})
		return
	}

	access_token, err := utils.CreateToken(config.AccessTokenExpiresIn, user.Userid, config.AccessTokenPrivateKey)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	ctx.SetCookie("access_token", access_token, config.AccessTokenMaxAge*60, "/", "localhost", false, true)
	ctx.SetCookie("logged_in", "true", config.AccessTokenMaxAge*60, "/", "localhost", false, false)

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "access_token": access_token})
}

func (ac *AuthController) LogoutUser(ctx *gin.Context) {
	ctx.SetCookie("access_token", "", -1, "/", "localhost", false, true)
	ctx.SetCookie("refresh_token", "", -1, "/", "localhost", false, true)
	ctx.SetCookie("logged_in", "", -1, "/", "localhost", false, false)

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}
