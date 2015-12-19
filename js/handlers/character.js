/*
 * character.js
 * handles character packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var data = require('../data.js');

var characterReply = {
  exists: 1,
  full: 2,
  notApproved: 4,
  ok: 5,
  deleted: 6
}

function character_handler(player, reader) {
  function character_request() {
    var reply = packet.builder(packet.family.CHARACTER, packet.action.REPLY);
    reply.addShort(1000);
    reply.addString('OK');
    player.send(reply);
  }

  function character_create() {
    reader.getInt();
    var gender = reader.getShort();
    var hairStyle = reader.getShort();
    var hairColor = reader.getShort();
    var race = reader.getShort();

    reader.getByte(); // ?
    var name = reader.getBreakString().toLowerCase();

    var reply = packet.builder(packet.family.CHARACTER, packet.action.REPLY);

    if (player.characters.length >= 3) {
      reply.addShort(characterReply.full);
    } else if (player.world.characterExists(name)) {
      reply.addShort(characterReply.exists);
    } else {
      player.addCharacter(name, gender, hairStyle, hairColor, race);
      console.log('New character: ' + name + ' (' + player.username + ')');

      reply.addShort(characterReply.ok);
      reply.addChar(player.characters.length);
      reply.addByte(1); // ?
      reply.addByte(255);
      utils.forEach(player.characters, function(c) {
        reply.addBreakString(c.name);
        reply.addInt(c.id);
        reply.addChar(c.level);
        reply.addChar(c.gender);
        reply.addChar(c.hairStyle);
        reply.addChar(c.hairColor);
        reply.addChar(c.race);
        reply.addChar(c.admin);

        // character->AddPaperdollData(reply, "BAHSW");*/
        reply.addShort(0);
        reply.addShort(0);
        reply.addShort(0);
        reply.addShort(0);
        reply.addShort(0);

        reply.addByte(255);
      });
    }

    player.send(reply);
  }

  function character_take() {
    reader.getShort(); // ?
    var id = reader.getInt();

    var reply = packet.builder(packet.family.CHARACTER, packet.action.PLAYER);
    reply.addShort(1000);
    reply.addInt(id);

    player.send(reply);
  }

  function character_remove() {
    reader.getInt(); // ?
    var id = reader.getShort();

    var character = player.characters.filter(function (c) {
      return c.id === id;
    })[0];

    if(!character) {
      return;
    }

    player.world.deleteCharacter(character.name);
    player.characters.splice(player.characters.indexOf(character), 1);

    var reply = packet.builder(packet.family.CHARACTER, packet.action.REPLY);
    reply.addShort(characterReply.deleted);
    reply.addChar(player.characters.length);
    reply.addByte(1);
    reply.addByte(255);

    utils.forEach(player.characters, function(c) {
      reply.addBreakString(c.name);
      reply.addInt(c.id);
      reply.addChar(c.level);
      reply.addChar(c.gender);
      reply.addChar(c.hairStyle);
      reply.addChar(c.hairColor);
      reply.addChar(c.race);
      reply.addChar(c.admin);

      // character->AddPaperdollData(reply, "BAHSW");*/
      reply.addShort(0);
      reply.addShort(0);
      reply.addShort(0);
      reply.addShort(0);
      reply.addShort(0);

      reply.addByte(255);
    });

    player.send(reply);
  }

	switch(reader.action) {
    case packet.action.REQUEST:
      character_request();
      break;
    case packet.action.CREATE:
      character_create();
      break;
    case packet.action.TAKE:
      character_take();
      break;
    case packet.action.REMOVE:
      character_remove();
      break;
		default:
			break;
	}
}

module.exports = character_handler;
