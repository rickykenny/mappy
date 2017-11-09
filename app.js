var
  express = require('express'),
  app = express(),
  path = require('path'),
  server = require('http').createServer(app),
  io = require('socket.io')(server);

//set the port
app.set('port', 3000);

//tell express that we want to use the 'client' folder
//for our static assets
app.use(express.static(path.join(__dirname, 'client')));

var rooms = [];
var users = [];
var allClients = [];

/**
 * SOCKET.IO
 */
io.on('connection', function (socket) {
  console.log('a user connected');
  allClients.push(socket);

  socket.on('disconnect', function () {
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    console.log('user disconnected');
  });

  socket.on('user-location-update', function (packet) {
    var userId = packet.userId;
    var room = rooms.find((room) => {
      return room.users.indexOf(userId) > -1;
    })
    if (room) {
      console.log('broadcasting ' + userId + ' location to ' + room.id);
      io.to(room.id).emit('other-user-location-update', packet);
    }
    console.log('user ' + packet.userId + ' location updated');
  })

  socket.on('join-room', function (packet) {
    var room = rooms.find((room) => room.id === packet.roomId);
    if (!room) {
      // create room
      room = {
        id: packet.roomId,
        users: [packet.userId]
      }
      rooms.push(room);
      room = rooms.find((room) => room.id === packet.roomId);
      console.log('user ' + packet.userId + ' created room ' + packet.roomId);
    } else {
      console.log('user ' + packet.userId + ' joined room ' + packet.roomId);
    }
    // add user to room
    socket.join(packet.roomId);
    room.users.push(packet.userId);
  })
});

// Listen for requests
server.listen(app.get('port'), function () {
  console.log('The server is running on http://localhost:' + app.get('port'));
});