
const express= require("express")
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
	extended: false
}))
app.use(bodyParser.json())

app.use(function(request,response, next){
	next()
})

//End Point  /signup/signup
const signUp=require("./signup")
app.use("/signup",signUp)

//End Point  /login/chklogin
const accountRouter=require("./login.js")
app.use("/chklogin",accountRouter)

const apiRouter=require("./users.js")
app.use("/api",apiRouter)

const userRouter=require("./users.js")
app.use("/users",userRouter)

const playlistRouter=require("./playlist-router.js")
app.use("/playlist",playlistRouter)


console.log("Start UP")
app.listen(9000)
