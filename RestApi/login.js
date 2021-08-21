const express = require('express')
const db=require('../routers/data_base')

const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

const router = express.Router()
const { authentication } = require("../middleware/authentication")
const secret = "superstar"

router.post("/chklogin", function (request, response) {

	
	const username = request.body.name
	const pass = request.body.pwd

	const salt = bcrypt.genSaltSync(10)
	const validationError = []
	if (username.length < 3) { validationError.push("Username must be 3 characters long.") }
	if (pass.length != 6) { validationError.push("Enter 6 characters for password.") }
	db.chkLogin(username, function (error, user) {
		if (user) {

			const dPassword = bcrypt.compareSync(pass, user.password)
			const uid = user.uid
				
			if (dPassword) {
				const payload = { username }
				jwt.sign(payload, secret, function (error, token) {
					response.status(200).json({
						"access_token": token
					})
				})

			}
			else {
				const err = "invalid Access!"
				response.status(404).json("User does not exist").end()
			}
		} else {
			const err = "invalid Access!"
			response.status(404).json("User does not exist").end()
		
		}

	})
})
module.exports = router