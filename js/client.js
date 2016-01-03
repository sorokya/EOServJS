/*
 * client.js - keeps track of an active eo client
 */

'use strict';

let fs = require('fs');
let packet = require('./packet');
let structs = require('./structs');
let init_handler = require('./handlers/init');
let login_handler = require('./handlers/login');
let account_handler = require('./handlers/account');
let character_handler = require('./handlers/character');
let welcome_handler = require('./handlers/welcome');
let face_handler = require('./handlers/face');
let walk_handler = require('./handlers/walk');
let emote_handler = require('./handlers/emote');
let sit_handler = require('./handlers/sit');
let chair_handler = require('./handlers/chair');
let attack_handler = require('./handlers/attack');
let talk_handler = require('./handlers/talk');
let warp_handler = require('./handlers/warp');
let chest_handler = require('./handlers/chest');
let paperdoll_handler = require('./handlers/paperdoll');
let door_handler = require('./handlers/door');
let item_handler = require('./handlers/item');
let utils = require('./utils');

module.exports = function (server, socket) {
	let clientState = {
		Uninitialized: 0,
		Initialized: 1,
		LoggedIn: 2,
		Playing: 3
	}
	
	let packetState = {
		ReadLen1: 0,
		ReadLen2: 1,
		ReadData: 2
	}
	
	let seq_start = 0;
	let upcoming_seq_start = -1;
	let seq = 0;
	
	// packet processor
	let processor = packet.processor();
	
	function initNewSequence() {
		seq_start = utils.random(0, 1757);
	}
	
	function pingNewSequence() {
		upcoming_seq_start = utils.random(0, 1757);
	}
	
	function pongNewSequence() {
		seq_start = upcoming_seq_start;
	}
	
	function getInitSequenceBytes() {
		let s1_max = (seq_start + 13) / 7;
		let s1_min = Math.max(0, (seq_start - 252 + 13 + 6) / 7);
		let s1 = utils.random(s1_min, s1_max);
		let s2 = seq_start - s1 * 7 + 13;
		
		return [s1, s2];
	}
	
	function genSequence() {
		let result = seq_start + seq;
		seq = (seq + 1) % 10;
		return result;
	}
	
	let client = {
		clientState: clientState,
		packetState: packetState,
		
		id: server.world.generatePlayerID(),
		state: clientState.Uninitialized,
		packet_state: packetState.ReadLen1,
		data: '',
		raw_length: [],
		length: 0,
		version: 0,
		player: null,
		processor: processor,
		server: server,
		
		initNewSequence: initNewSequence,
		getInitSequenceBytes: getInitSequenceBytes,
		send: function (builder) {
			let data = processor.encode(builder.get());
			
			let buffData = [];
			for (let i = 0; i < data.length; i++) {
				buffData.push(data[i].charCodeAt());
			}
			
			let buff = new Buffer(buffData);
			socket.write(buff);
		},
		uploadFile: function (type, filename, init_reply) {
			let $this = this;
			fs.readFile('./' + filename, function (err, file) {
				let fileStr = packet.bufferToStr(file);
				let builder = packet.builder(packet.family.INIT, packet.action.INIT);
				builder.addChar(init_reply);
				
				if (type !== structs.fileType.map) {
					builder.addChar(1);
				}
				
				builder.addString(fileStr);
				$this.send(builder);
			});
		},
		upload: function (type, id, init_reply) {
			switch (type) {
				case structs.fileType.map:
					let fileName = '';
					
					for (let i = 0; i < 5 - id.toString().length; i++) {
						fileName += '0';
					}
					
					fileName += id + '.emf';
					
					return this.uploadFile(type, 'data/maps/' + fileName, init_reply);
					break;
				case structs.fileType.item:
					return this.uploadFile(type, 'data/pub/dat001.eif', init_reply);
					break;
				case structs.fileType.npc:
					return this.uploadFile(type, 'data/pub/dtn001.enf', init_reply);
					break;
				case structs.fileType.spell:
					return this.uploadFile(type, 'data/pub/dsl001.esf', init_reply);
					break;
				case structs.fileType.class:
					return this.uploadFile(type, 'data/pub/dat001.ecf', init_reply);
					break;
				default:
					return;
			}
		},
		close: function () {
			socket.destroy();
		},
		tick: function () {
      
		}
	}
	
	function execute(data) {
		let decData = processor.decode(data);
		let reader = packet.reader(decData);
		
		if (reader.family !== packet.family.INIT) {
			let pingReply = reader.family === packet.family.CONNECTION && reader.action === packet.action.PING;
			
			if (pingReply) {
				pongNewSequence();
			}
			
			let client_seq;
			let server_seq = genSequence();
			if (server_seq >= 253) {
				client_seq = reader.getShort();
				
				// NOTE: this seems like a total hack.. but it works.
				if (client_seq > 1757) {
					reader = packet.reader(decData);
					client_seq = reader.getChar();
				}
			} else {
				client_seq = reader.getChar();
			}
      
      // todo: enforce seq check
      
		} else {
			genSequence();
		}
		
		switch (reader.family) {
			case packet.family.INIT:
				init_handler(client, reader);
				break;
			case packet.family.LOGIN:
				login_handler(client, reader);
				break;
			case packet.family.ACCOUNT:
				account_handler(client, reader);
				break;
			case packet.family.CHARACTER:
				character_handler(client.player, reader);
				break;
			case packet.family.WELCOME:
				welcome_handler(client.player, reader);
				break;
			case packet.family.FACE:
				face_handler(client.player.character, reader);
				break;
			case packet.family.WALK:
				walk_handler(client.player.character, reader);
				break;
			case packet.family.EMOTE:
				emote_handler(client.player.character, reader);
				break;
			case packet.family.SIT:
				sit_handler(client.player.character, reader);
				break;
			case packet.family.CHAIR:
				chair_handler(client.player.character, reader);
				break;
			case packet.family.ATTACK:
				attack_handler(client.player.character, reader);
				break;
			case packet.family.TALK:
				talk_handler(client.player.character, reader);
				break;
			case packet.family.WARP:
				warp_handler(client.player.character, reader);
				break;
			case packet.family.CHEST:
				chest_handler(client.player.character, reader);
				break;
			case packet.family.PAPERDOLL:
				paperdoll_handler(client.player.character, reader);
				break;
			case packet.family.DOOR:
				door_handler(client.player.character, reader);
				break;
			case packet.family.ITEM:
				item_handler(client.player.character, reader);
				break;
			default:
				break;
		}
	}
	
	socket.on('data', function (data) {
		let dataStr = packet.bufferToStr(data).split('');
		let done = false;
		let oldlength;
		
		while (dataStr.length > 0 && !done) {
			switch (client.packet_state) {
				case client.packetState.ReadLen1:
					client.raw_length[0] = dataStr[0].charCodeAt();
					dataStr[0] = '\0';
					dataStr.splice(0, 1);
					client.packet_state = client.packetState.ReadLen2;
					
					if (dataStr.length === 0) {
						break;
					}
				case client.packetState.ReadLen2:
					client.raw_length[1] = dataStr[0].charCodeAt();
					dataStr[0] = '\0';
					dataStr.splice(0, 1);
					client.length = packet.packEOInt(client.raw_length[0], client.raw_length[1]);
					client.packet_state = client.packetState.ReadData;
					
					if (dataStr.length === 0) {
						break;
					}
				case client.packetState.ReadData:
					oldlength = client.data.length;
					client.data += dataStr.join('').substr(0, client.length);
					
					for (let i = 0; i < Math.min(dataStr.length, client.length); i++) {
						dataStr[i] = '\0';
					}
					
					dataStr.splice(0, client.length);
					client.length -= client.data.length - oldlength;
					
					if (client.length === 0) {
						execute(client.data);
						client.data = '';
						client.packet_state = client.packetState.ReadLen1;
						done = true;
					}
					
					break;
			}
		}
	});
	
	function popClient() {
		if (client.player && client.player.online) {
			server.world.logout(client.player.username);
		}
		
		server.clients.slice(server.clients.indexOf(server.clients.filter(function (c) {
			return c.id === client.id;
		})[0]), 1);
	}
	
	socket.on('error', function (err) {
		popClient();
	});
	
	socket.on('end', function (err) {
		popClient();
	});
	
	server.clients.push(client);
}
