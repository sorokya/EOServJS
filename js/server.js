var net = require('net');
var client = require('./client.js');
var world = require('./world.js');
var eodata = require('./eodata.js');

var bind = '0.0.0.0';
var port = 8078;
var server;
var clients = [];

var eoserver = {
  clients: clients,
  world: null,
  eodata: null,
  start: function() {
    this.eodata = eodata();

    server = net.createServer();
    server.listen(port, bind);

    console.log('Server Listening on ' + bind + ':' + port);

    server.on('connection', function(socket) {
      console.log('New connection from ' + socket.remoteAddress);
      client(eoserver, socket);
    });
  }
}

eoserver.world = world(eoserver);

module.exports = eoserver;
