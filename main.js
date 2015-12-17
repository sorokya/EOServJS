var net = require('net');
var client = require('./js/client.js');

var server = net.createServer();
server.listen(8078, '0.0.0.0');

server.on('connection', function(socket) {
  client(socket);
});
