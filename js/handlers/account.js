/*
 * account.js
 * handles account packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var data = require('../data.js');

var accountReply = {
	exists: 1,
	notApproved: 2,
	created: 3,
	changeFailed: 5,
	changed: 6,
  continue: 1000
}

function account_handler(client, reader) {
	function account_request() {
		reader.getChar(); // ?
		reader.getChar(); // ?
		var username = reader.getEndString().toLowerCase();

		var reply = packet.builder(packet.family.ACCOUNT, packet.action.REPLY);
		
		if(data.users.filter(function(user) {
			return user.account.username === username;
		}).length > 0) {
			reply.addShort(accountReply.exists);
			reply.addString('NO');
		} else {
			reply.addShort(accountReply.continue);
			reply.addString('OK');
		}
		
		client.write(reply);
	}
	
	function account_create() {
		reader.getBreakString(); // ?
		
		var username = reader.getBreakString().toLowerCase();
		var password = reader.getBreakString();
		var fullname = reader.getBreakString();
		var location = reader.getBreakString();
		var email = reader.getBreakString();
		var computer = reader.getBreakString();
		var hdid = Number(reader.getBreakString());
		
		var user = data.newUser(username, password, fullname, location, email, computer, hdid);
		user.save(function() {
			var reply = packet.builder(packet.family.ACCOUNT, packet.action.REPLY);
			reply.addShort(accountReply.created);
			reply.addString('OK');
			client.write(reply);
		});
	}

	switch(reader.action) {
		case packet.action.REQUEST:
			account_request();
			break;
		case packet.action.CREATE:
			account_create();
			break;
		default:
			break;
	}
}

module.exports = account_handler;
