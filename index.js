const express = require('express');
const socketio = require('socket.io');
const http=require('http');
const cors = require('cors');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const PORT= process.env.PORT || 4000       //// puerto asignado
const router = require ('./router');
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(router);

//socket.io///////////////////socket.io////////////////////socket.io/////////
const io=socketio(server);

io.on('connect', (socket) => {
  
  //     ======>>>>>    AL UNIRSE A LA SALA        /////////

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);
    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: ` ${user.name} se unio a la sala ` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  })
  //     ======>>>>>    AL ENVIAR EL MENSAJE/////////

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  //     ======>>>>>    AL IRSE DE LA SALA /////////

  socket.on('disconnect', ()=>{
   
    const user = removeUser(socket.id)
    if(user){
      io.to(user.room).emit('message', {user: 'admin', text:`${user.name} is gone from this room ${user.room}`})
    }
  })
})

////////////////////////////////////////////////////////////////////////////
app.use(cors);
app.use(router);

 server.listen(PORT)
