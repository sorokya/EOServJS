/*
 * login.js
 * handles login packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');

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
