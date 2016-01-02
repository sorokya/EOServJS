/*
 * attack.js
 * handles attack packet
 */

var config = require('../config.js');
var packet = require('../packet.js');
var structs = require('../structs.js');

function attack_handler(character, reader) {
	var direction = reader.getChar();
	var timestamp = reader.getThree();
	var timestampDiff = timestamp - character.timestamp;
	
	if (config.enforceTimestamps) {
		if (timestampDiff < 48) {
			return;
		}
	}
	
	character.timestamp = timestamp;
	
	if (character.sitting !== structs.sitState.stand) {
		return;
	}
	
	if (config.enforceWeight && character.weight > character.max_weight) {
		return;
	}
	
	var limitAttack = config.limitAttack;
	if (limitAttack && character.attacks >= limitAttack) {
		return;
	}
	
	if (!config.enforceTimestamps || timestampDiff >= 60) {
		direction = character.direction;
	}
	
	character.attack(direction);
}

module.exports = attack_handler;