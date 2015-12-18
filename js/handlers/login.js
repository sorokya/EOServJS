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
		reader.getChar(); // ?
		var username = reader.getBreakString();
		var password = reader.getBreakString();

		var user = data.users.filter(function(user) {
			return user.account.username === username && user.account.password === password;
		})[0];
		
		var reply = packet.builder(packet.family.LOGIN, packet.action.REPLY);

		if(!user) {
			reply.addShort(loginReply.wrongUserPass);
			client.write(reply);
		} else {
			reply.addShort(loginReply.ok);
			reply.addChar(0);
			reply.addByte(2);
			reply.addByte(255);
			client.write(reply);
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
