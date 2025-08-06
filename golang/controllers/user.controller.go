package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wpcodevo/golang-gorm-postgres/models"
	"gorm.io/gorm"
)

type UserController struct {
	DB *gorm.DB
}

func NewUserController(DB *gorm.DB) UserController {
	return UserController{DB}
}

func (uc *UserController) GetMe(ctx *gin.Context) {
	currentUser := ctx.MustGet("currentUser").(models.User)

	user := map[string]interface{}{
		"userid": currentUser.Userid,
		"name":   currentUser.Name,
		"email":  currentUser.Email,
		"avatar": currentUser.Avatar,
		"role":   currentUser.RoleID,
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success", "data": gin.H{
			"user": user,
		},
	})
}
