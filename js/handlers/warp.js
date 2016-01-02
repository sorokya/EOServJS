/*
 * warp.js - handles warp packet
 */

var packet = require('../packet.js');
var structs = require('../structs.js');
var utils = require('../utils.js');

function warp_handler(character, reader) {
	function warp_accept() {
		var anim = character.warp_anim;
		
		if (anim !== structs.warpAnimation.invalid) {
			character.warp_anim = structs.warpAnimation.invalid;
		} else {
			return;
		}
		
		var updateCharacters = [];
		var updateNPCs = [];
		var updateItems = [];
		
		utils.forEach(character.map.characters, function (char) {
			if (char.charInRange(character)) {
				updateCharacters.push(char);
			}
		});
		
		var reply = packet.builder(packet.family.WARP, packet.action.AGREE);
		reply.addChar(2); // ?
		reply.addShort(character.mapid);
		reply.addChar(anim);
		reply.addChar(updateCharacters.length);
		reply.addByte(255);
		utils.forEach(updateCharacters, function (char) {
			reply.addBreakString(char.name);
			reply.addShort(char.playerID());
			reply.addShort(char.map);
			reply.addShort(char.x);
			reply.addShort(char.y);
			reply.addChar(char.direction);
			reply.addChar(6); // ?
			reply.addString(char.paddedGuildTag());
			reply.addChar(char.level);
			reply.addChar(char.gender);
			reply.addChar(char.hairStyle);
			reply.addChar(char.hairColor);
			reply.addChar(char.race);
			reply.addShort(char.max_hp);
			reply.addShort(char.hp);
			reply.addShort(char.map_tp);
			reply.addShort(char.tp);
			char.addPaperdollData(reply, 'B000A0HSW');
			reply.addChar(char.sitting);
			reply.addChar(char.hidden);
			reply.addByte(255);
		});
		
		reply.addByte(255);
		character.send(reply);
	}
	
	function warp_take() {
		character.player.client.upload(structs.fileType.map, character.mapid, structs.initReply.banned);
	}
	
	switch (reader.action) {
		case packet.action.ACCEPT:
			warp_accept();
			break;
		case packet.action.TAKE:
			warp_take();
			break;
	}
}

module.exports = warp_handler;