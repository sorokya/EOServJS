/*
 * world.js - handles all maps and charcters on the server
 */

'use strict';

var data = require('./data.js');
var utils = require('./utils.js');
var player = require('./player.js');
var map = require('./map.js');
var structs = require('./structs.js');
var packet = require('./packet.js');
var config = require('./config.js');

module.exports = function (server) {
    var world = {
        server: server,
		characters: [],
		parties: [],
		homes: null,
		quests: [],
		boards: [],
		expTable: [],
		instrumentIds: [],
		lastCharacterCount: 0,
		adminCount: 0,
		maps: [],
		eif: null,
		enf: null,
		ecf: null,
		esf: null,
		getHome: function (character) {
			var home;
			
			for (let i = 0; i < this.homes.length; i++) {
				if (this.homes[i].id === character.home) {
					return this.homes[i];
				}
			}
			
			var currentHomeLevel = -2;
			utils.forEach(this.homes, function (h) {
				if (typeof h.level !== 'undefined' && h.level <= character.level && h.level > currentHomeLevel) {
					home = h;
					currentHomeLevel = h.level;
				}
			});
			
			return home;
		},
		getHomeID: function (id) {
			for (let i = 0; i < this.homes.length; i++) {
				if (this.homes[i].id === id) {
					return this.homes[i];
				}
			}
			
			return 0;
		},
		serverMsg: function (message) {
			var builder = packet.builder(packet.family.TALK, packet.action.SERVER);
			builder.addBreakString(message);
			
			utils.forEach(this.characters, function (char) {
				char.send(builder);
			});
		},
		announceMsg: function (from, message, echo) {
			var fromStr = from ? from.name : 'server';
			var builder = packet.builder(packet.family.TALK, packet.action.ANNOUNCE);
			builder.addBreakString(fromStr);
			builder.addBreakString(message);
			
			utils.forEach(this.characters, function (char) {
				if (char !== from || echo) {
					char.send(builder);
				}
			});
		},
		msg: function (from, message, echo) {
			var fromStr = from ? from.name : 'server';
			
			var builder = packet.builder(packet.family.TALK, packet.action.MSG);
			builder.addBreakString(fromStr);
			builder.addBreakString(message);
			
			utils.forEach(this.characters, function (char) {
				if (char !== from || echo) {
					char.send(builder);
				}
			});
		},
		getCharacter: function (name) {
			var found = this.characters.filter(function (char) {
				return char.name === name;
			});
			
			if (found && found.length) {
				return found[0];
			}
		},
		getMap: function (id) {
			return this.maps[id];
		},
		generatePlayerID: function () {
			var lowestFreeID = 1;
			
			(function findNextID() {
				utils.forEach(server.clients, function (c) {
					if (c.id === lowestFreeID) {
						lowestFreeID = c.id + 1;
						findNextID();
					}
				});
			})();
			
			return lowestFreeID;
		},
		generateCharacterID: function () {
			return ++this.lastCharacterCount;
		},
		loginChar: function (character) {
			this.characters.push(character);
			var map = this.getMap(character.mapid);
			map.enter(character, structs.warpAnimation.none);
			character.login();
		},
		login: function (username) {
			return player(username);
		},
		logoutChar: function (character) {
			if (this.getMap(character.mapid)) {
				this.getMap(character.mapid).leave(character, structs.warpAnimation.none);
			}
			
			this.characters.splice(this.characters.indexOf(this.characters.filter(function (char) {
				return char.id === character.id;
			})[0]), 1);
		},
		logout: function (username) {
			var client = server.clients.filter(function (c) {
				return c.player && c.player.username === username && c.player.online;
			})[0];
			
			if (client) {
				if (client.player.character) {
					client.player.character.logout();
				}
				
				client.player.online = false;
				client.close();
			}
		},
		playerExists: function (username) {
			return server.clients.filter(function (c) {
				return c.player && c.player.username === username;
			}).length > 0;
		},
		playerOnline: function (username) {
			return server.clients.filter(function (c) {
				return c.player && c.player.username === username && c.player.online;
			}).length > 0;
		},
		characterExists: function (name) {
			var characters = [];
			utils.forEach(data.users, function (u) {
				utils.forEach(u.characters, function (c) {
					characters.push(c);
				});
			});
			
			return characters.filter(function (c) {
				return c.name === name;
			}).length > 0;
		},
		deleteCharacter: function (name) {
			var user = data.users.filter(function (_user) {
				return _user.characters.filter(function (char) {
					return char.name === name;
				}).length > 0
			})[0];
			
			if (user) {
				var char = user.characters.filter(function (char) {
					return char.name === name;
				})[0];
				
				if (char) {
					user.characters.splice(user.characters.indexOf(char), 1);
					user.save();
				}
			}
		},
		loadMaps: function () {
			for (var i = 0; i < config.Maps; i++) {
				world.maps.push(map(i, world));
			}
		}
	};
	
	function recover() {
		utils.forEach(world.characters, function (char) {
			var updated = false;
			
			if (char.hp !== char.max_hp) {
				if (char.sitting === structs.sitState.stand) {
					char.hp += config.HPRecoverRate * char.max_hp;
				} else {
					char.hp += config.SitHPRecoverRate * char.max_hp;
				}
				
				char.hp = Math.min(char.hp, char.max_hp);
				updated = true;
			}
			
			if (char.tp !== char.max_tp) {
				if (char.sitting === structs.sitState.stand) {
					char.tp += config.TPRecoverRate * char.max_tp;
				} else {
					char.tp += config.SitTPRecoverRate * char.max_tp;
				}
				
				char.tp = Math.min(char.tp, char.max_tp);
				updated = true;
			}
			
			
			if (updated) {
				var builder = packet.builder(packet.family.RECOVER, packet.action.PLAYER);
				builder.addShort(char.hp);
				builder.addShort(char.tp);
				builder.addShort(0); // ?
				char.send(builder);
			}
		});
	}
	
	setInterval(recover, config.RecoverSpeed);
	
	return world;
}
