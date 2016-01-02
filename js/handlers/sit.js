/*
 * sit.js
 * handles sit packet
 */

var packet = require('../packet.js');
var structs = require('../structs.js');

function sit_handler(character, reader) {
	var action = reader.getChar();
	var reply;
	
	if (action === structs.sitAction.sit && character.sitting === structs.sitState.stand) {
		reply = packet.builder(packet.family.SIT, packet.action.PLAYER);
		reply.addShort(character.playerID());
		reply.addChar(character.x);
		reply.addChar(character.y);
		reply.addChar(character.direction);
		reply.addChar(0); // ?
		character.send(reply);
		character.sit(structs.sitState.floor);
	} else if (action === structs.sitAction.stand && character.sitting === structs.sitState.floor) {
		reply = packet.builder(packet.family.SIT, packet.action.CLOSE);
		reply.addShort(character.playerID());
		reply.addChar(character.x);
		reply.addChar(character.y);
		character.send(reply);
		character.stand();
	}
}

module.exports = sit_handler;