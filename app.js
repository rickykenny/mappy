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

/**
 * server functions
 */
var rooms = [];
var users = [];
var userRoomLookup = [];
var allClients = [];

var createRoom = function (roomId, creator) {
  console.log(`Creating room ${roomId}`);
  var room = {
    id: roomId,
    created: new Date(),
    createdBy: creator.id,
    users: [],
    lastActivity: new Date()
  }
  rooms.push(room);
  return room;
}

var joinRoom = function (roomId, user) {
  console.log(`User ${user.id} is joining room ${roomId}`);
  var room = rooms.find((room) => room.id === roomId);
  if (!room) {
    room = createRoom(roomId, user);
  }
  room.users.push(user);
  updateRoom(room);

  userRoomLookup.push({
    userId: user.id,
    roomId: roomId
  });
}

var updateUser = function (user) {
  console.log(`Updating ${user.id} with accuracy ${user.location.accuracy}`);
  var lookup = userRoomLookup.find((lookup) => lookup.userId === user.id);
  var roomIndex = rooms.findIndex((room) => room.id === lookup.roomId);
  var roomUserIndex = rooms[roomIndex].users.findIndex((u) => u.id === user.id);
  rooms[roomIndex].users[roomUserIndex] = user;
  var room = rooms[roomIndex];
  updateRoom(room);
}

var updateRoom = function (newRoom) {
  console.log(`Updating room ${newRoom.id} from ${rooms.length} rooms`);

  var roomIndex = rooms.findIndex((room) => room.id == newRoom.id);
  console.log(`room index is ` + roomIndex) 
  if (roomIndex === -1) {
    throw new Error(`room ${newRoom.id} not found but there is ${rooms[0].id}`)
  }
  rooms[roomIndex] = newRoom;

  console.log(`Broadcasting update to ${newRoom.id} (${newRoom.users.length} users)`);
  io.to(newRoom.id).emit('room-update', newRoom);
}

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

  socket.on('user-update', function (packet) {
    updateUser(packet);
  })

  socket.on('room-join', function (packet) {
    // add user to room
    socket.join(packet.roomId);
    joinRoom(packet.roomId, packet.user);
  })
});

// Listen for requests
server.listen(app.get('port'), function () {
  console.log('The server is running on http://localhost:' + app.get('port'));
});