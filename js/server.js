var net = require('net');
var config = require('./config.js');
var client = require('./client.js');
var world = require('./world.js');
var eodata = require('./eodata.js');
var utils = require('./utils.js');

var server;
var clients = [];

var eoserver = {
	clients: clients,
	world: null,
	eodata: null,
	running: true,
	start: function () {
		this.eodata = eodata();
		this.world.eif = this.eodata.EIF;
		this.world.enf = this.eodata.ENF;
		this.world.ecf = this.eodata.ECF;
		this.world.esf = this.eodata.ESF;
		this.world.homes = this.eodata.homes;
		
		this.world.loadMaps();
		
		server = net.createServer();
		server.listen(config.port, config.host);
		
		console.log('Server Listening on ' + config.host + ':' + config.port);
		
		server.on('connection', function (socket) {
			console.log('New connection from ' + socket.remoteAddress);
			client(eoserver, socket);
		});
		
		var $this = this;
		setInterval(function () {
			utils.forEach($this.clients, function (client) {
				client.tick();
			});
		}, 100);
	}
}

eoserver.world = world(eoserver);

module.exports = eoserver;
