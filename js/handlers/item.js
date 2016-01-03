/*
 * item.js - handles item packets
 */

'use strict';

let packet = require('../packet');
let structs = require('../structs');
let config = require('../config');
var utils = require('../utils');

function item_handler(character, reader) {
	
	// NOTE: player uses an item
	function item_use() {

	}
	
	// NOTE: player drops an item on the ground
	function item_drop() {
		if (character.trading) {
			return;
		}

		let id = reader.getShort();
		let amount;

		if (character.world.eif.get(id).special === structs.EIFSpecial.lore) { 
			return;
		}

		if (reader.remaining() == 5) {
			amount = reader.getThree();
		} else {
			amount = reader.getInt();
		}

		let x = reader.getByte().charCodeAt();
		let y = reader.getByte().charCodeAt();

		amount = Math.min(amount, config.MaxDrop);

		if (amount <= 0) {
			return;
		}

		if (x === 255 && y === 255) {
			x = character.x;
			y = character.y;
		} else {
			x = packet.packEOInt(x);
			y = packet.packEOInt(y);
		}

		let distance = utils.pathLength(x, y, character.x, character.y);

		if (distance > config.DropDistance) { 
			return;
		}

		if (!character.map.walkable(x, y)) {
			return;
		}

		if (character.hasItem(id) >= amount) {
			

			let item = character.map.addItem(id, amount, x, y, character);

			if (item) {
				let unProtectTime = new Date;
				unProtectTime.setMilliseconds(unProtectTime.getMilliseconds() + config.ProtectPlayerDrop);
				
				item.unProtectTime = unProtectTime;
				item.owner = character.playerID();
				character.map.updateItem(item);

				character.delItem(id, amount);

				let reply = packet.builder(packet.family.ITEM, packet.action.DROP);
				reply.addShort(id);
				reply.addThree(amount);
				reply.addInt(character.hasItem(id));
				reply.addShort(item.uid);
				reply.addChar(x);
				reply.addChar(y);
				reply.addChar(character.weight);
				reply.addChar(character.max_weight);
				character.send(reply);
			}
		}
	}
	
	
	// NOTE: player junks an item
	function item_junk() {
		if (character.trading) {
			return;
		}

		let id = reader.getShort();
		let amount = reader.getInt();

		if (amount <= 0) {
			return;
		}

		if (character.hasItem(id) >= amount) {
			character.delItem(id, amount);

			let reply = packet.builder(packet.family.ITEM, packet.action.JUNK);
			reply.addShort(id);
			reply.addThree(amount);
			reply.addInt(character.hasItem(id));
			reply.addChar(character.weight);
			reply.addChar(character.max_weight);
			character.send(reply);
		}
	}
	
	// NOTE: player picks up an item from the ground
	function item_get() {
		let uid = reader.getShort();
		let item = character.map.getItem(uid);

		if (item) {
			let now = new Date;
			let distance = utils.pathLength(item.x, item.y, character.x, character.y);

			if (distance > config.DropDistance) {
				return;
			}

			if (item.owner !== character.playerID() && item.unProtectedTime > now) {
				return;
			}

			let taken = character.canHoldItem(item.id, item.amount);

			if (taken > 0) {
				character.addItem(item.id, taken);

				let reply = packet.builder(packet.family.ITEM, packet.action.GET);
				reply.addShort(uid);
				reply.addShort(item.id);
				reply.addThree(taken);
				reply.addChar(character.weight);
				reply.addChar(character.max_weight);
				character.send(reply);

				character.map.delSomeItem(item.uid, taken, character);
			}
		}
	}

	switch (reader.action) {
		case packet.action.USE:
			item_use();
			break;
		case packet.action.DROP:
			item_drop();
			break;
		case packet.action.JUNK:
			item_junk();
			break;
		case packet.action.GET:
			item_get();
			break;
		default:
			break;
	}
}

module.exports = item_handler;