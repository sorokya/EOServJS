'use strict';

const net = require('net');
const config = require('./config.js');
const client = require('./client.js');
const world = require('./world.js');
const eodata = require('./eodata.js');
const utils = require('./utils.js');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var server;
var clients = [];

function EOServer() {
	this.clients = clients;
	this.world = null;
	this.eodata = null;
	this.running = false;
	this.start = function () {
		this.world = world(this);
		this.eodata = eodata();
		this.world.eif = this.eodata.EIF;
		this.world.enf = this.eodata.ENF;
		this.world.ecf = this.eodata.ECF;
		this.world.esf = this.eodata.ESF;
		this.world.homes = this.eodata.homes;
		
		this.world.loadMaps();
		
		server = net.createServer();
		server.listen(config.port, config.host);
		
		this.running = true;
		this.emit('log', 'Server Listening on ' + config.host + ':' + config.port);
		this.emit('ready');

		var $this = this;
		server.on('connection', function (socket) {
			$this.emit('log', 'New connection from ' + socket.remoteAddress);
			client(eoserver, socket);
		});
		
		setInterval(function () {
			utils.forEach($this.clients, function (client) {
				client.tick();
			});
		}, 100);
	}
	
	this.stop = function () {
		this.running = false;
		
		let $this = this;
		utils.forEach(this.clients, function (c) {
			if (c.player) {
				$this.world.logout(c.player.username);
			}
		});
		
		utils.forEach(this.clients, function (c) {
			c.close();
		});

		server.close();
	}

	EventEmitter.call(this);
}

util.inherits(EOServer, EventEmitter);

let eoserver = new EOServer;

module.exports = eoserver;
