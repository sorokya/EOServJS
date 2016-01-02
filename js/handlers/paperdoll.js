/*
 * paperdoll.js - handles paperdoll packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var structs = require('../structs.js');

function handle_paperdoll(character, reader) {
	function paperdoll_request() {
		var id = reader.getShort();
		var target = character.map.getCharacterPID(id);
		
		if (!target) {
			target = character;
		}
		
		var home = character.homeString();
		var guild = character.guildNameString();
		var rank = character.guildRankString();
		
		var reply = packet.builder(packet.family.PAPERDOLL, packet.action.REPLY);
		reply.addBreakString(target.name);
		reply.addBreakString(home);
		reply.addBreakString(target.partner);
		reply.addBreakString(target.title);
		reply.addBreakString(guild);
		reply.addBreakString(rank);
		reply.addShort(target.playerID());
		reply.addChar(target.class);
		reply.addChar(target.gender);
		reply.addChar(0); // ?
		
		utils.forEach(target.paperdoll, function (item) {
			reply.addShort(item);
		});
		
		if (target.admin >= structs.adminLevel.HGM) {
			if (target.party) {
				reply.addChar(structs.paperDollIcon.hgmParty);
			} else {
				reply.addChar(structs.paperDollIcon.hgm);
			}
		} else if (target.admin >= structs.adminLevel.GUIDE) {
			if (target.party) {
				reply.addChar(structs.paperDollIcon.gmParty);
			} else {
				reply.addChar(structs.paperDollIcon.gm);
			}
		} else if (target.party) {
			reply.addChar(structs.paperDollIcon.party);
		} else {
			reply.addChar(structs.paperDollIcon.normal);
		}
		
		character.send(reply);
	}
	
	function paperdoll_remove() {
		var itemID = reader.getShort();
		var subLoc = reader.getChar();
		
		if (character.world.eif.get(itemID).special === structs.EIFSpecial.cursed) {
			return;
		}
		
		if (character.unequip(itemID, subLoc)) {
			var reply = packet.builder(packet.family.PAPERDOLL, packet.action.REMOVE);
			reply.addShort(character.playerID());
			reply.addChar(structs.avatarSlots.clothes);
			reply.addChar(0); // sound
			character.addPaperdollData(reply, 'BAHWS');
			reply.addShort(itemID);
			reply.addChar(subLoc);
			reply.addShort(character.max_hp);
			reply.addShort(character.max_tp);
			reply.addShort(character.adjust_str);
			reply.addShort(character.adjust_int);
			reply.addShort(character.adjust_wis);
			reply.addShort(character.adjust_agi);
			reply.addShort(character.adjust_con);
			reply.addShort(character.adjust_cha);
			reply.addShort(character.min_dmg);
			reply.addShort(character.max_dmg);
			reply.addShort(character.accuracy);
			reply.addShort(character.evade);
			reply.addShort(character.armor);
			character.send(reply);
		}
		
		var builder = packet.builder(packet.family.AVATAR, packet.action.AGREE);
		builder.addShort(character.playerID());
		builder.addChar(structs.avatarSlots.clothes);
		builder.addChar(0); // sound
		character.addPaperdollData(builder, 'BAHWS');
		
		utils.forEach(character.map.characters, function (char) {
			if (char !== character && character.charInRange(char)) {
				char.send(builder);
			}
		});
	}
	
	function paperdoll_add() {
		if (character.trading) {
			return;
		}
		
		var itemID = reader.getShort();
		var subLoc = reader.getChar();
		
		if (character.equip(itemID, subLoc)) {
			var reply = packet.builder(packet.family.PAPERDOLL, packet.action.AGREE);
			reply.addShort(character.playerID());
			reply.addChar(structs.avatarSlots.clothes);
			reply.addChar(0); // sound
			character.addPaperdollData(reply, 'BAHWS');
			reply.addShort(itemID);
			reply.addThree(character.hasItem(itemID));
			reply.addChar(subLoc);
			reply.addShort(character.max_hp);
			reply.addShort(character.max_tp);
			reply.addShort(character.adjust_str);
			reply.addShort(character.adjust_int);
			reply.addShort(character.adjust_wis);
			reply.addShort(character.adjust_agi);
			reply.addShort(character.adjust_con);
			reply.addShort(character.adjust_cha);
			reply.addShort(character.min_dmg);
			reply.addShort(character.max_dmg);
			reply.addShort(character.accuracy);
			reply.addShort(character.evade);
			reply.addShort(character.armor);
			character.send(reply);
		}
		
		var builder = packet.builder(packet.family.AVATAR, packet.action.AGREE);
		builder.addShort(character.playerID());
		builder.addChar(structs.avatarSlots.clothes);
		builder.addChar(0); // sound
		character.addPaperdollData(builder, 'BAHWS');
		
		utils.forEach(character.map.characters, function (char) {
			if (char !== character && character.charInRange(char)) {
				char.send(builder);
			}
		});
	}
	
	switch (reader.action) {
		case packet.action.REQUEST:
			paperdoll_request();
			break;
		case packet.action.REMOVE:
			paperdoll_remove();
			break;
		case packet.action.ADD:
			paperdoll_add();
			break;
	}
}

module.exports = handle_paperdoll;