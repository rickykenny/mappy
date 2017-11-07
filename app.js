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

// set up socket.io
io.on('connection', function (socket) {
  console.log('a user connected');
});

// Listen for requests
server.listen(app.get('port'), function () {
  console.log('The server is running on http://localhost:' + app.get('port'));
});