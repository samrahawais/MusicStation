const sqlite3=require('sqlite3')
const { Console } = require("console")
const db= new sqlite3.Database('f:/part78/MS/myDB.db')


//************************************************************************** */
db.run('CREATE TABLE IF NOT EXISTS sessions(sessionId INTEGER,uid INTEGER FORIEGN KEY )')

db.run('CREATE TABLE IF NOT EXISTS accounts(uid INTEGER  PRIMARY KEY,username TEXT UNIQUE, password TEXT, email TEXT,token TEXT )')

db.run('CREATE TABLE IF NOT EXISTS playlist(pid INTEGER PRIMARY KEY,pname TEXT, sid INTEGER FORIEGN KEY ,uid INTEGER FORIEGN KEY, isPublic INTEGER)')

db.run('CREATE TABLE IF NOT EXISTS songs(sid INTEGER PRIMARY KEY AUTOINCREMENT ,songtitle TEXT,duration REAL,genre TEXT)')

//--------------------------------------------------------------------------------

exports.getAllPlaylists=function(callback){
    const query="SELECT * FROM playlist WHERE isPublic= 1 GROUP BY pname"
	db.all(query,function(error,pl){
        callback(error,pl)
    })
}

exports.getAllPrivatePlaylists=function(uid,callback){
    const query="SELECT * FROM playlist WHERE isPublic= 0 AND uid=? GROUP BY pname"
    const value=[uid]
	db.all(query,value,function(error,privatepl){
        callback(error,privatepl)
    })
}

exports.getAllPublicPlaylists=function(uid,callback){
    const query="SELECT * FROM playlist WHERE isPublic= 1 AND uid=? GROUP BY pname"
    const value=[uid]
	db.all(query,value,function(error,pl){
        callback(error,pl)
    })

}

exports.getGenreSongs=function(genre,callback){

    const query="select * from songs where genre=?"
    const value=[genre]
    db.all(query,value,function(error,songs)
    {
        callback(error,songs)
    })
}
exports.allPlaylists=function(callback){
    const query="SELECT * FROM playlist "
	db.all(query,function(error,pl){
        callback(error,pl)
    })

}

exports.getSessionId=function(sessionId,callback){
    const q1="select * from sessions where sessionId=?"
	const v1=[sessionId]
	db.get(q1,v1,function(error,currentUser){
        callback(error,currentUser)
    })
}

exports.getPlaylistById=function(uid,callback){
    const query="SELECT * FROM playlist WHERE playlist.uid=? GROUP BY pname"
    const value=[uid]
    db.all(query,value,function(error,pl){
            callback(error,pl)
        })
}

exports.getAllAccounts=function(callback){
    const query= "SELECT * FROM accounts"
    db.all(query,function(error,users)
    {
        callback(error,users)
})
}

exports.getAccountById=function(uid,callback){
    const query= "SELECT * FROM accounts where uid=?"
    const value=[uid]
   db.get(query,value,function(error,myaccount)
   {
        callback(error,myaccount)
   })
}

exports.getAllSongsPL=function(pname,callback){
    const query="SELECT * from songs,playlist where playlist.pname=? AND playlist.sid=songs.sid"
    const value=[pname]
	db.all(query,value,function(error,playlistdetails)
          {
            callback(error,playlistdetails)
        })
}

exports.getAllSongs=function(callback){
    const query="SELECT * from songs"
	db.all(query,function(error,songresult)
          {
              callback(error,songresult)
        })
}

exports.getPlaylistDetails=function(pname, callback){

    const query="select * from playlist,songs where playlist.pname=? AND playlist.sid=songs.sid"
	const value=[pname]
	
	db.all(query,value,function(error,playlistdetails)
	{
      	callback(error,playlistdetails)
    })
}

exports.getPlaylistByName=function(pname, callback){
    const query="select * from playlist where pname=?"
    const value=[pname]
        
        db.get(query,value,function(error,ListName)
        {
         callback(error,ListName)
        })
    }

exports.createSession=function(sessionId,uid,callback){
    const q2="insert into sessions(sessionId,uid) VALUES(?,?) "
    const v2=[sessionId,uid]
	db.run(q2,v2,function(error,id)
	{
        callback(error,this.lastID)
    })
}           

exports.createAccount = function (id,username,password,email,callback) {
    const query = 'INSERT INTO accounts(uid,username,password,email)VALUES(?,?,?,?)'
    const values = [id, username, password, email]
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.createPlaylist=function(uid,sid,chk,pname,callback){
    const query="INSERT INTO playlist (uid,sid,isPublic,pname) VALUES (?,?,?,?)"
    const values=[uid,sid,chk,pname]

    db.run(query, values, function(error)
            {
            callback(error)
            })
}

exports.chkLogin=function(username,callback){
    const query="SELECT * FROM accounts WHERE username=?"// AND password=?"// AND accounts.id=playlist.accountId"
	values=[username]
	
	db.get(query, values, function(error,user){
            callback(error,user)
    })
}

exports.updateProfile=function(username, password,email,cid ,callback){
    const query='UPDATE accounts set username= ? ,password= ?,email= ? WHERE uid=?'
    values=[username,password,email,cid]
    db.run(query,values,function(error)
    {
    callback(error)
    })
}

exports.deletePlaylistById=function(uid,callback){
const q1='Select * from playlist where uid=?'
const v1=[uid]
db.all(q1,v1,function(error,record){
    if(record){
        const query='DELETE FROM playlist WHERE playlist.uid=?'
						values=[uid]
						db.run(query,values,function(error)
						{
                            callback(error)
                        })
    }
})
}

exports.deleteUserById=function(uid,callback){
    const q2='delete from accounts where accounts.uid=?'
    const v2=[uid]
    db.run(q2,v2,function(error)
    {
        callback(error)
    })
}

exports.updatePlaylistbyIdd = function (uid, sid, chk, pname,oldpname, callback) {
    const query = "UPDATE playlist SET uid=?,sid=?,isPublic=?,pname=? WHERE playlist.pname=?"
    const values = [uid, sid, chk, pname,oldpname]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.updatePlaylistbyId = function (userID, oldpname, callback) {
    const q1 = "delete from playlist where pname=? and uid=?"
    const v1 = [oldpname, userID]
    db.run(q1, v1, function (error) {
        callback(error)
    })
}


//------------------------------for api
exports.updatePL=function(oldpname,pname,songId,isPublic,userId,callback){
    const query="UPDATE playlist SET uid=?,sid=?,isPublic=?,pname=? WHERE playlist.pname=?"
    const values=[userId,songId,isPublic,pname,oldpname]
    db.run(query,values,function(error){
        callback(error)
    })
}


exports.deleteSession=function(callback){
    const q1="delete from sessions"
	db.run(q1,function(error)
    {
        callback(error)
})
}

exports.deletePlaylistByName=function(pname,callback){
    const query='DELETE FROM playlist WHERE pname=?'
	values=[pname]

	db.run(query,values,function(error)
	{
    callback(error)
})
}
