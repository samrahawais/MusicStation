const { authentication } = require("../middleware/authentication")
const router = require("./users")
const db = require('../routers/data_base')





//-------create playlist------------------------------------
router.post("/create-playlist",authentication, function (request, response) {
	const uid = request.body.uid
	const sid = request.body.sid
	const isPublic = request.body.isPublic
	const pname = request.body.pname

	db.createPlaylist(uid, sid, isPublic, pname, function (error) {
		if (error) {
			response.status(404).json("Cannot create Playlist").end()
		} else {
			response.status(201).json("Playlist Created")
		}

	})
})

//---update playlist--------------
router.put("/updatePlaylist/:oldpname",authentication,function (request, response) {
	const oldpname = request.params.oldpname
	const pname = request.body.pname
	const userId = request.body.uid
	const songId = request.body.sid
	const isPublic = request.body.isPublic
	db.getPlaylistByName(oldpname,function(error, ListName){
		if(ListName){

	db.updatePL(oldpname, pname, songId, isPublic, userId, function (error) {
		if (error) {
			response.status(404).send("Cannot update")
		}
		else {
			response.status(200).send("Successfully updated")
		}
	})
}else{
	response.status(404).send("Playlist doesnot exist").end()
}
})
})

//------------------view all playlists

router.get("/allPlaylists", function (request, response) {
	
	db.allPlaylists(function (error, pl) {
		if (error) {
			response.status(404).end()
		} else {
			response.status(200).json(pl)
		}
	})
})

		//----------------------view all songs-------------------------------
router.get("/songs", function (request, response) {
	db.getAllSongs(function (error, songresult) {
		if (error) { response.status(404).end() }
		else if (!songresult) {
			response.status(404).send("No Songs available").end()
		} else
			response.status(200).json(songresult)

	})
})

		//-----------------------------view 1 playlist---------------------------
router.get("/playlists/:pname", authentication, function (request, response) {
	const pl = []
	const pname = request.params.pname
	db.getPlaylistByName(pname, function (error, ListName) {
		if (ListName) {
			db.getPlaylistDetails(pname, function (error, playlistdetails) {
				if (error) {
					response.status(400).end()
				}
				else {
					response.status(200).json(playlistdetails)
				}
			})
		} else {
			response.status(404).send("No Playlist available").end()
		}
	})
})
		
		//-----------------------------delete 1 playlist--------------------------------------------------------
router.delete("/playlists/:pname",authentication, function (request, response) {
	const pname = request.params.pname
	db.getPlaylistByName(pname, function (error, ListName) {
		if (ListName) {
	db.deletePlaylistByName(pname, function (error) {
		if (error) {
			response.status(404).end()
		}

		else {
			response.status(200).send("Successfully deleted the playlist")
		}
	})
}else{
	response.status(404).send("No Playlist available").end()
}
})
})


module.exports = router