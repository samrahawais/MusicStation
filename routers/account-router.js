const express= require("express")
const app = express()
app.use(express.static("public"))


const router=express.Router()
const db=require('../routers/data_base')
const bcrypt= require('bcrypt')

const MIN_USERNAME_LENGTH=3

//     /account/register
router.post("/register", function(request, response)
{
    const id=this.lastID+1
	const username=request.body.name
	const pass=request.body.pwd
	const email=request.body.email
	const saltRounds=10
	
const salt=bcrypt.genSaltSync(10)
const password=bcrypt.hashSync(pass,salt)
const validationError=[]
	if(username.length<MIN_USERNAME_LENGTH){ validationError.push("Username must be "+MIN_USERNAME_LENGTH+ "characters long.")}
	
	if(pass.length!= 6){ validationError.push("Password must be exactly 6 characters long.")}
	if(validationError.length==0)
    { 
		db.createAccount(id,username,password,email,function(error)
    		 {
				 if(error){
					console.log(error)
				}
			    
	    })
	        response.redirect("/login")
				
	}else
	{
		response.redirect("/signup")
	}
})


//----------------------------------Display User to Update-------------------------------//
router.get("/Allaccounts", function(request, response)
{
    db.getAllAccounts(function(error,users)
	{
        if (error)
            {
            console.log(error)
            }else{
                const model={
							users
							}
                response.render("accounts.hbs",model)
                }
    })
}) 

//-----------------------------------------------
router.get("/", function(request, response)
{
	const sessionId=request.session.id
	db.getSessionId(sessionId,function(error,currentUser){
		if(error)
		{
			console.log("error finding user id" +error)
		}
		else
		{
			const id=currentUser.uid
	   		db.getAccountById(id,function(error,myaccount){
			if (error)
            {
            console.log(error)
            }else{
                const model=myaccount
				response.render("myaccount.hbs",model)
                }
        	})
		}		
	})
})

//----------------------------------------------------------------------------
router.get("/otherUsers/:uid", function(request, response){
	const id =  request.params.uid // 3
	//isLoggedIn=request.session.isLoggedIn
	db.getAllPublicPlaylists(id,function(error,playlists){
	if (error){
		const  model={
		dbError: true,
		}
	console.log(error)	
	}
	else
	{
	const model = {
					playlists,
					dbError: false,
				//	isLoggedIn
					}
	response.render("showOtherUserDetails.hbs",model)
	}
	})
})
//------------------------------Get user details-------------------------------
router.get("/users/:uid", function(request, response){
	const id =  request.params.uid // 3
	isLoggedIn=request.session.isLoggedIn
	db.getAccountById(id,function(error,myaccount){
	if (error){
		const  model={
		dbError: true,
		}
	console.log(error)	
	}
	else
	{
	const model = {
					myaccount,
					dbError: false,
					isLoggedIn
					}
	response.render("showUserDetails.hbs",model)
	}
	})
})

//--------------------------------Edit User----------------------------------------------
router.post("/updateUser", function(request, response)
{
    const cid=request.body.uid
   db.getAccountById(cid,function(error,myaccount){
    	if(error)
        {
		    const model=
            {
		    dbError: true
		    }
		    console.log(error)
		}
	    else
        { 
		    const model={
		    dbError:false,
			myaccount	}
		response.render('Updateuser.hbs',model)
	    }
    })
}) 

//------------------------------Update User Data in DB---------------------------//

router.post("/updateProfile", function(request, response)
{
	const cid=request.body.id
	const Newusername=request.body.name
	const Newpassword=request.body.pwd
	const Newemail=request.body.email
	const validationError=[]

	const salt=bcrypt.genSaltSync(10)
	const NewPass=bcrypt.hashSync(Newpassword,salt)
	if(Newusername.length<MIN_USERNAME_LENGTH){ validationError.push("Username must be "+ MIN_USERNAME_LENGTH+ "characters long")}
	if(Newpassword.length!=6){validationError.push("Enter 6 characters for password")} 
	
	if(validationError.length==0)
        {
			db.updateProfile(Newusername,NewPass,Newemail,cid,function(error)
			{
		    if(error)
		    {
			    console.log(error)
		    }else
			    {
				  response.redirect('/playlist/toHome')
			    }
		})
	}else{
		const model={
			validationError,
			Newusername,Newemail
		            }
	response.render("updateUser.hbs",model)
		}
})

//-----------------------------------Delete User-------------------------------//
router.get("/deleteme", function(request, response)
{
	const sessionId=request.session.id
	db.getSessionId(sessionId,function(error,currentUser)
	{		
		if(error)
		{
			console.log("error getting session" +error)
		}else
		{		
			const uid=currentUser.uid
			db.getAccountById(uid,function(error,myaccount)
			{
			    if (error)
			    {
		    		console.log(error)
		    	}else
            	{
					const model={myaccount}
					response.render("deleteUser.hbs",model)
				}
			})
		}	
	}) 
})

//-------------------------------Delete user from DB-------------------//
router.get("/deleteUser/:uid",function(request,response){
	const id=request.params.uid
	db.deletePlaylistById(id,function(error)
	{
		if(error)
		{
		console.log("error deleting playlists of the user"+ error)
		}
		else
		{
			db.deleteUserById(id,function(error)
			{
				if(error)
				{
				console.log("error deleting user from accounts"+error)
				}else
					{
					response.redirect("/index")
					}
			})
		}
	})
})

//-------------------------------------------------------------------------
router.post("/deleteUser", function(request, response)
{
	const validationError=[]
	const isLoggedIn=request.session.isLoggedIn
	if(!isLoggedIn)
		{
			validationError.push("You are not Logged in")
		}
		const sessionId=request.session.id
		db.getSessionId(sessionId,function(error,currentUser)
		{
			if(error)
			{
				console.log("error finding user id" +error)
			}else
			{
				const id=currentUser.uid
					if(validationError.length==0)
					{
					db.deletePlaylistById(id,function(error)
					{
						if(error)
						{
							console.log("error deleting playlists of the user"+ error)
						}
						else
						{
						db.deleteUserById(id,function(error)
						{
							if(error)
							{
							console.log("error deleting user from accounts"+error)
							}
							else
							{
							response.redirect("/logout")
							}
						})
						}
					})
					}else
					{
						response.render("index.hbs",model)
					}
			}
		})
	})


module.exports=router
