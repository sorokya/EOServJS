/*
 * door.js - handles door packets
 */

'use strict';

let packet = require('../packet');

function door_handler(character, reader) {
	let x = reader.getChar();
	let y = reader.getChar();

	character.map.openDoor(character, x, y);
}

module.exports = door_handler;