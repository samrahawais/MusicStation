const express= require("express")
const app = express()
app.use("/public",express.static("public"))
const router=express.Router()

const db=require('../routers/data_base')
const graphdb=require('../graphDB')

router.get("/", function(request, response)
{ 
	db.getAllPlaylists(function(error,pl){
		if(error){
				console.log(error)
				const model={dberror:true}
				response.render("start.hbs",model)}
		else{
				const model={
				dberror:false,
				pl
				}
			response.render("start.hbs",model)
			}
	})
})

//-----------------------------------------------------------------------
router.get("/index", function(request, response)
{
	const sessionid=request.session.id
	db.getAllPlaylists(function(error,pl)
	{
		if(error){
			console.log(error)
			const model={dberror:true}
			response.render("index.hbs",model)}
		else{
			const model={
				dberror:false,privatepl,
				pl}
			response.render("index.hbs",model)
		}
	})
})

//---------------------------------------------------------------------------
router.post("/genre", function(request, response)
{
	const genre=request.body.genre
	db.getGenreSongs(genre,function(error,songs)
	{
		if(error){
			console.log(error)
			const model={dberror:true}
			response.render("genre.hbs",model)}
		else{
			const model={
				dberror:false,
				songs}
				response.render("genre.hbs",model)
			}
	})
})

//---------------------------------------------------------------------------

router.get("/toHome",function(request, response)
{
	const sessionid=request.session.id
	db.getSessionId(sessionid,function(error,currentUser)
	{
		if(error)
		{
			console.log("Error after getsession ID:" +error)
		}
		else if(currentUser){
			userid=currentUser.uid
			}
		if(request.session.isLoggedIn)
			{
			db.getAllPrivatePlaylists(userid,function(error,privatepl)
			{
				db.getAllPublicPlaylists(userid,function(error,pl)
				{
					if(error)
					{
						const model={dberror:true}
						response.render("start.hbs",model)
					}
					else
					{
						const model=
						{
						dberror:false,
						pl,privatepl
						}
					response.render("start.hbs",model)
			 		}
				})
			})
		}else
			response.redirect("/login")
	})
})


//----------------------Create Playlist---------------------------------
router.get("/songs", function(request, response)
{
	db.getAllSongs(function(error,songresult)
	{
		if(error)
			{ console.log("ERROR IN SELECT SONGS" + error)	}
		else
		{
			const model={	songresult }
			response.render("showSongs.hbs",model)
		}
	})
})

//-----------------Save playlist in DB Check-------------------------------------
router.post("/", function (request, response) 
{
	const pname = request.body.pname
	if(!pname)
	{
		response.redirect("/playlist/songs")
	}else
	{
	const sessionId = request.session.id
	db.getSessionId(sessionId, function (error, currentUser)
	{
		if (error) {
			console.log("coulnt get the uid" + error)
		}
		else
		{
			var index = 0;
			var songid = []
			const uid = currentUser.uid
			const isChecked = request.body.isChecked
			if (isChecked == 'on')
				chk = 0
			else
				chk = 1
			
			songid = request.body.songid
				for (index = 0; index < songid.length; index++)
				{
					db.createPlaylist(uid, songid[index], chk, pname, function (error)
					{
					if (error) {
						console.log("ERROR IN inserting values in playlist" + error)
					}
				}) 
				}
			response.redirect("/playlist/toHome")
		}
	})
}
})

//-----------------------------Display songs in a playlist---------------------------
router.get("/playlists/:pname", function (request, response)
{
	const pl = []
	const pname = request.params.pname
	db.getPlaylistDetails(pname, function (error, playlistdetails)
	{
		if (error) {
			console.log(error)
		}
		else {
			const model =
			{
			playlistdetails, pname
			}
		response.render('playlists.hbs', model)
		}
	})
})

//-----------------------------Update /Edit- Playlist---------------------------------------------------------
router.get("/editPL",function(request,response)
	{
		const sessionId=request.session.id
		db.getSessionId(sessionId,function(error,currentUser)
		{
			if(error)
			{
				console.log("error finding user id" +error)
			}
			else
			{
				const uid=currentUser.uid
				db.getPlaylistById(uid,function(error,pl)
				{
				if (error)
				{
					console.log(error)
				}
				else
				{
				const model={
						pl
						}
				response.render("editPL.hbs",model)//In else redirects to deletePlaylist.hbs
				}
				})
			}
		})
})

//---------------------------------------------------------------------------------------------

	router.post("/editablePL",function(request,response)
	{
		const pname=request.body.pname
		var isPrivate
		db.getAllSongs(function(error,songresult)
		{
			db.getPlaylistDetails(pname, function(error, playlistdetails)
			{
			if(error){
				console.log(error)
			}
			else
			{
			
				for(index=0;index<songresult.length;index++)
				{
					for(subIndex=0;subIndex<playlistdetails.length; subIndex++)
					{
						if(songresult[index].sid==playlistdetails[subIndex].sid)
						{
							songresult[index].isChecked = true
						}
					}
				}
				
				if(playlistdetails[0].isPublic == 0)
				{
					isPrivate=true
				}
				else{
				isPrivate= false
				} 
				const model={
					playlistdetails,// selected songs in playlist
					songresult,//all songs in db
					pname
					,isPrivate		
				} 
			response.render("EditPlaylist.hbs",model)
			}
		})
	})
})
	

//------------------------------Update Playlist in DB---------------------------//

router.post("/updatePlaylist", function (request, response) {
	var index
	var songid = []
	const plName = request.body.newpname
	const oldpname = request.body.oldpname
	const userID = request.body.uid
	const isChecked = request.body.isChecked
	
	if (isChecked == 'on')

		chk = 0

	else
		chk = 1

	songid = request.body.songid
	db.deletePlaylistByName(oldpname, function(error) {
		for (index = 0; index < songid.length; index++)
		{
		db.createPlaylist(userID, songid[index], chk, plName, function (error) {
				if (error) {
					console.log("ERROR IN inserting values in playlist" + error)
				}
			})
		}
	})
		response.redirect("/playlist/toHome")
	})

	//------------------------------Display Playlist to Delete---------------------------------------
	router.get("/deletePL", function (request, response) {
		const sessionId = request.session.id
		db.getSessionId(sessionId, function (error, currentUser) {
			if (error) {
				console.log("error finding user id" + error)
			}
			else {
				const uid = currentUser.uid
				db.getPlaylistById(uid, function (error, pl) {
					if (error) {
						console.log(error)
					}
					else {
						const model = {
							pl
						}
						response.render("deletePlaylist.hbs", model)
					}
				})
			}
		})
	})

//---------------------------------------------Delete Playlist from DB	------------
router.post("/deletePlaylist", function(request, response)
{
	playlistName=request.body.pname
	db.deletePlaylistByName(playlistName,function(error)
	{
		if(error){
			console.log(error +" in Deleteing playlist")
		}
	})
	response.redirect("/playlist/toHome")
})



module.exports=router