var net = require('net');
var client = require('./js/client.js');
var data = require('./js/data.js');

var bind = '0.0.0.0';
var port = 8078;

console.log('____ ____ ____ ____ ____ _  _   _ ____');
console.log('|___ |  | [__  |___ |__/ |  |   | [__ ');
console.log('|___ |__| ___] |___ |  \\  \\/  ._| ___]')

console.log('Accounts: ' + data.users.length);
console.log('Characters: ' + data.getCharacterCount());
console.log('Guilds: ' + data.guilds.length);

var server = net.createServer();
server.listen(port, bind);

console.log('Server Listening on ' + bind + ':' + port);

server.on('connection', function(socket) {
  client(socket);
});
