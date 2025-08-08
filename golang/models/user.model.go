package models

import "time"

type User struct {
	Userid             string    `gorm:"column:userid;type:uuid;primaryKey" json:"userid"`
	Username           string    `gorm:"column:username;type:text" json:"username"`
	Email              string    `gorm:"column:email;type:text;not null" json:"email"`
	Name               string    `gorm:"column:name;type:text" json:"name"`
	RoleID             int       `gorm:"column:role_id" json:"role_id"`
	PasswordHash       string    `gorm:"column:password_hash;type:text;not null" json:"password_hash"`
	Status             int       `gorm:"column:status;default:1" json:"status"`
	PasswordResetToken string    `gorm:"column:password_reset_token;type:text" json:"password_reset_token"`
	VerificationToken  string    `gorm:"column:verification_token;type:text" json:"verification_token"`
	AuthKey            string    `gorm:"column:auth_key;type:text" json:"auth_key"`
	Avatar             string    `gorm:"column:avatar;type:text" json:"avatar"`
	GoogleID           string    `gorm:"column:google_id;type:text" json:"google_id"`
	FbID               string    `gorm:"column:fb_id;type:text" json:"fb_id"`
	CreatedBy          string    `gorm:"column:created_by;type:text" json:"created_by"`
	CreatedAt          time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at" json:"updated_at"`
	UpdatedBy          string    `gorm:"column:updated_by;type:text" json:"updated_by"`
	CompanyID          string    `gorm:"column:companyid;type:text" json:"companyid"`
	Lang               string    `gorm:"column:lang;type:text" json:"lang"`
	Address            string    `gorm:"column:address;type:text" json:"address"`
}

type SignUpInput struct {
	Name                 string `json:"name" binding:"required"`
	Email                string `json:"email" binding:"required"`
	Password             string `json:"password" binding:"required,min=8"`
	PasswordConfirmation string `json:"passwordConfirmation" binding:"required"`
	// Photo           string `json:"photo" binding:"required"`
}

type SignInInput struct {
	Email    string `json:"email"  binding:"required"`
	Password string `json:"password"  binding:"required"`
}
