/*
 * commands.js - handles all admin commands
 */

var structs = require('./structs.js');
var packet = require('./packet.js');

function warp(from, args) {
	var map = Number(args[0]);
	var x = Number(args[1]);
	var y = Number(args[2]);
	
	from.warp(map, x, y, structs.warpAnimation.admin);
}

function warpToMe(from, args) {
	var to = from.world.getCharacter(args[0]);
	to.warp(from.mapid, from.x, from.y, structs.warpAnimation.admin);
}

function warpMeTo(from, args) {
	var to = from.world.getCharacter(args[0]);
	from.warp(to.mapid, to.x, to.y, structs.warpAnimation.admin);
}

function spawnItem(from, args) {
	var id = Number(args[0]);
	var amount = args.length > 1 ? Number(args[1]) : 1;
	
	if (from.addItem(id, amount)) {
		var reply = packet.builder(packet.family.ITEM, packet.action.GET);
		reply.addShort(0); // UID
		reply.addShort(id);
		reply.addThree(amount);
		reply.addChar(from.weight);
		reply.addChar(from.max_weight);
		from.send(reply);
	}
}

module.exports = {
	execute: function (character, command, args) {
		switch (command) {
			case 'w':
			case 'warp':
				warp(character, args);
				break;
			case 'wtm':
			case 'warptome':
				warpToMe(character, args);
				break;
			case 'wmt':
			case 'warpmeto':
				warpMeTo(character, args);
				break;
			case 'si':
			case 'sitem':
				spawnItem(character, args);
				break;
		}
	}
}