const express= require("express")
const app = express()
app.use(express.static("public"))
const expressSession=require("express-session")
const SQLiteStore=require('connect-sqlite3')(expressSession)
const bcrypt= require('bcryptjs')

const graphDB = require("./graphDB")
const linkedData = require("./linkedData")
var graphDbSongs = []

app.use(expressSession({
	secret:"asdfgjdfsd",
	saveUninitialized:false,
	resave:false,
	store:new SQLiteStore()
}))

const expressHandlebars = require('express-handlebars')
app.engine('hbs',expressHandlebars({
    extName: ".hbs",
    defaultLayout: "main.hbs",
	StyleSheet:"/style.css"
	}))
	var hbs = expressHandlebars.create({});

var db=require('./routers/data_base.js')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
	extended: true
}))

const sqlite3=require('sqlite3')
const { Console } = require("console")

//*************************************************************** */
app.use(function(request,response, next){
	const isLoggedIn=request.session.isLoggedIn
	response.locals.isLoggedIn=isLoggedIn
next()
})

//*************************************************************** */
const accountRouter=require("./routers/account-router.js")
const playlistRouter=require("./routers/playlist-router.js")

app.use("/playlist",playlistRouter)
app.use("/account",accountRouter)

var graph=[]

//********************helper function */
hbs.handlebars.registerHelper('selectedSongs', function (obj1,obj2) {

var i, r
for( i=0;i<=obj1.length;i++)
	{
		if(obj1[i]==obj2[i])
		return true

		else
			return false
	
		}
}); 


//  ********************ROUTERS************************************//
app.get("/", function(request, response)
{
	response.redirect("/playlist")
})

//-------------------About-----------------------------------------
app.get("/about", function(request, response)
{
	response.render("about.hbs")
})

//--------------------Contact--------------------------------------
app.get("/contact", function(request, response)
{
	response.render("contact.hbs")
})

//-------------------SignUp---------------------------------------
app.get("/signUp", function(request, response){
	response.render("signUp.hbs")
})

//----------------Login------------------------------------------
app.get("/login", function(request, response){
	response.render("login.hbs")
})
//---------------------------------------------------------------
app.post("/chklogin", function(request, response)
{
	const username=request.body.name
	const pass=request.body.pwd
	const saltRounds=10
	
	const validationError=[]
	if (username.length < 3) { validationError.push("Username must be 3 characters long.") }
	if (pass.length != 6) { validationError.push("Enter 6 characters for password.") }
	
		db.chkLogin(username,function(error,user)
		{ 
		if(user){
		const dPassword= bcrypt.compareSync(pass,user.password)
			const uid=user.uid
				    		
		if(!dPassword)
			{
				validationError.push("Invalid Password")
				const model={validationError}
				response.render("login.hbs",model)
			}
			else 
			{	
        		request.session.isLoggedIn=true
				const sessionId=request.session.id
						
				db.createSession(sessionId,uid,function(error)
					{
					if(error)
						{
							console.log("Error in session input"+error)	
			
						}
						else{
							response.redirect("/playlist/toHome")
							}
					})
        	}
		}else{
			validationError.push("Invalid username")
				const model={validationError}
				response.render("login.hbs",model)
		}
		})
	})

//---------------------- after deleting profile -LOGOUT----------------------------------
app.get("/logout",function(request,response)
{
	request.session.isLoggedIn=false
	db.deleteSession(function(error)
	{
	if(error)
	{
		console.log(error)
	}
	else{
		request.session.destroy()
		}
	})
	response.redirect("/login")
})

//------------------------------------------------------
app.post("/logout",function(request,response)
{
	request.session.isLoggedIn=false
	db.deleteSession(function(error)
	{
		if(error){
		console.log(error)
					}
		else{
			request.session.destroy()
			}
	})
	response.redirect("/login")
})

//--------------PART 7 GRAPH DB-----------------------------------
app.get("/getSongs",function(request,response){

	var allSongs = []
		graphDB.getSongs(function(error, records){
			graphDB.getGenre(function(error,genres){
			if(error){
				console.log(error)
			}else{
				allSongs=records
				const model={
					allSongs,genres
				}
				response.render("TopSongs.hbs",model)
			}
		})
	})
})

//-------------------------------------------------------------------
app.post("/getGenre", function(request, response){
	var genre=request.body.genre
	var PopSongs = []
	
	graphDB.getGenreSongs(genre,function(error,records){
		if (error) {
			console.log(error)
		  } else {
			PopSongs=records
			const model = {
			  PopSongs
			}
		console.log(PopSongs)
		response.render("genre.hbs",model)
		  }
	})
})

/////////////////PART 8
app.post("/getLinkedDataSongs", function (request, response) {
var singer=request.body.singer

	var allSongs = []
	var arr=[]
	linkedData.getLinkedDataSongs(singer,function (rec) {
		{
			arr=rec
			const model = {
				graph:arr,singer
			}
			response.render("LinkedDataSongs.hbs", model)
		}
			
	})
})

app.listen(8000)