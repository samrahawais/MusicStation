const express = require('express')
var db = require('../routers/data_base')

var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const router = express.Router()

//Create USer API  
router.post("/signup", function (request, response) {
	console.log("im in /register")
	const id = this.lastID + 1
	const username = request.body.name
	const pass = request.body.pwd
	const email = request.body.email

	const validationError = []
	if (username.length < 3) { validationError.push("Username must be 3 characters long.") }
	if (pass.length != 6) { validationError.push("Enter 6 characters for password.") }

	const salt = bcrypt.genSaltSync(10)
	const password = bcrypt.hashSync(pass, salt)
	console.log("salt" + salt)
	console.log("hashed password" + password)
			
	if(validationError.length == 0)
	{
		
				db.createAccount(id, username, password, email,function (error) {
					if (error) 
						{
							response.status(404).json("Cannot create").end()
						}
						else{
							response.status(201).json("Account Successfully Created")
						}
					
				})
	}else 
		{
		response.json(validationError)
		}
})


module.exports = router