/*
 * login.js
 * handles login packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var data = require('../data.js');

var loginReply = {
	wrongUser: 1,
	wrongUserPass: 2,
	ok: 3,
	loggedIn: 5,
	busy: 6
}

function login_handler(client, reader) {
	function login_request() {
		var username = reader.getBreakString().toLowerCase();
		var password = reader.getBreakString();

		var user = data.users.filter(function(user) {
			return user.account.username === username && user.account.password === password;
		})[0];

		var reply = packet.builder(packet.family.LOGIN, packet.action.REPLY);

		if(!user) {
			reply.addShort(loginReply.wrongUserPass);
			client.send(reply);
		} else if (client.server.world.playerOnline(username)) {
			reply.addShort(loginReply.loggedIn);
			client.send(reply);
		} else {
			client.state = client.clientState.loggedIn;
			client.player = client.server.world.login(username);
			client.player.setClient(client);
			client.player.id = client.id;

			reply.addShort(loginReply.ok);
			reply.addChar(client.player.characters.length);
			reply.addByte(2);
			reply.addByte(255);

			utils.forEach(client.player.characters, function(c) {
				reply.addBreakString(c.name);
				reply.addInt(c.id);
				reply.addChar(c.level);
				reply.addChar(c.gender);
				reply.addChar(c.hairStyle);
				reply.addChar(c.hairColor);
				reply.addChar(c.race);
				reply.addChar(c.admin);

				// TODO: real paperdoll data
				// character->AddPaperdollData(reply, "BAHSW");*/
				reply.addShort(0);
				reply.addShort(0);
				reply.addShort(0);
				reply.addShort(0);
				reply.addShort(0);

				reply.addByte(255);
			});

			client.send(reply);
		}
	}

	switch(reader.action) {
		case packet.action.REQUEST:
			login_request();
			break;
		default:
			break;
	}
}

module.exports = login_handler;
