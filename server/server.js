const express = require("express")
const socketIO = require('socket.io');

const app = express()
	.listen(4000, () => console.log(`Listening on localhost:4000`));


const io = socketIO(app, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		transports: ['websocket', 'polling'],
		credentials : true
	},
	allowEIO3: true
});


let users = []
let rooms = []

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {
	  console.log('user disconnected');
	  rooms = [];
	});
	socket.on('connexion', (username, room) =>{
		if(rooms[room]){
			socket.join(room);
			rooms[room].user2 = username
			console.log(`${username} join room ${room}`);
			io.in(room).emit('user', rooms[room])
		}else{
			socket.join(room);
			rooms[room] = {user1: username, user2: ""}
			console.log(`${username} create room ${room}`);
			io.in(room).emit('user', rooms[room])
		}
	
	})
	socket.on('sendMessage', (room, messages) =>{
		io.in(room).emit('reciveMessage', messages)
	})
  });



// webSocket.on('request', (req) => {
//     const connection = req.accept()

//     connection.on('message', (message) => {
//         const data = JSON.parse(message.utf8Data)

//         const user = findUser(data.username)

//         switch(data.type) {
//             case "store_user":

//                 if (user != null) {
//                     return
//                 }

//                 const newUser = {
//                      conn: connection,
//                      username: data.username
//                 }

//                 users.push(newUser)
//                 console.log(newUser.username)
//                 break
//             case "store_offer":
//                 if (user == null)
//                     return
//                 user.offer = data.offer
//                 break
            
//             case "store_candidate":
//                 if (user == null) {
//                     return
//                 }
//                 if (user.candidates == null)
//                     user.candidates = []
                
//                 user.candidates.push(data.candidate)
//                 break
//             case "send_answer":
//                 if (user == null) {
//                     return
//                 }

//                 sendData({
//                     type: "answer",
//                     answer: data.answer
//                 }, user.conn)
//                 break
//             case "send_candidate":
//                 if (user == null) {
//                     return
//                 }

//                 sendData({
//                     type: "candidate",
//                     candidate: data.candidate
//                 }, user.conn)
//                 break
//             case "join_call":
//                 if (user == null) {
//                     return
//                 }

//                 sendData({
//                     type: "offer",
//                     offer: user.offer
//                 }, connection)
                
//                 user.candidates.forEach(candidate => {
//                     sendData({
//                         type: "candidate",
//                         candidate: candidate
//                     }, connection)
//                 })

//                 break
//         }
//     })

//     connection.on('close', (reason, description) => {
//         users.forEach(user => {
//             if (user.conn == connection) {
//                 users.splice(users.indexOf(user), 1)
//                 return
//             }
//         })
//     })
// })

function sendData(data, conn) {
    conn.send(JSON.stringify(data))
}

function findUser(username) {
    for (let i = 0;i < users.length;i++) {
        if (users[i].username == username)
            return users[i]
    }
}