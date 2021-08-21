const express = require('express')
var db=require('../routers/data_base')

var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const router = express.Router()
const { authentication } = require("../middleware/authentication")

//----------------------------------------------------------------------------------
router.get("/AllUsers", function(request, response)		//  /account/Allaccount
{
	console.log("inside all account")
    db.getAllAccounts(function(error,users)
	{
        if (error)
            {
                response.status(404).end()
            }else{
                response.status(200).json(users)
              
                }
    })
}) 

//--------------------------------------------------------------------
router.put("/updateProfile/:id",authentication, function(request, response)
{
	const cid=request.params.id
	const Newusername=request.body.name
	const Newpass=request.body.pwd
	const  salt = bcrypt.genSaltSync(10)
	const Newpassword = bcrypt.hashSync(Newpass, salt)
	const Newemail=request.body.email
	const validationError=[]

	if(Newusername.length<3){ validationError.push("Username must be 3 characters long.")}
	if(Newpass.length!=6){validationError.push("Enter 6 characters for password.")} 
	
	if (validationError.length == 0) 
	{
		db.getAccountById(cid,function(error,myaccount)
		{
			if(myaccount){
				db.updateProfile(Newusername, Newpassword, Newemail, cid, function (error) {
					if (error) 
					{
						response.status(404).json(error)
					
					} else {
						response.status(201).send("Successfully Update ")
					}
				})
			} else {
			response.status(404).send("User Does not exist ")
			
					}
		})
	}else {
		response.json(validationError)
		}
})

 ///------------------------------Get user details-------------------------------
router.get("/users/:uid",authentication, function(request, response){			//    /account/users/1
	const id =  request.params.uid // 3
	db.getAccountById(id,function(error,myaccount){
	if (error){
        response.status(404).send("Bad Request").end()
		}
	else if(!myaccount)
	{
		response.status(404).send("User Does not exist ")
	}
	else
	{
        response.status(200).json(myaccount)
}
	})
	
}) 
//-----------------------------------Delete User-------------------------------//

router.delete("/deleteme/:id",authentication, function(request, response)
{
	const uid=request.params.id
	db.getAccountById(uid,function(error,myaccount){
		if(myaccount){
			db.deleteUserById(uid,function(error)
			{
			    if (error)
			    {
                    response.status(404).send("Cannot find Account Details")
		    	}else
            	{
                    response.status(200).send("Successfuly deleted the user")
				}
			})
			
		}
		else{response.status(404).send("User Does not exist ")}
	})
})





	
module.exports=router


