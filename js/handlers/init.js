/*
 * init.js
 * handles init packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');

function solveChallenge(i) {
  ++i;
  return 110905 + (i % 9 + 1) * ((11092004 - i) % ((i % 11 + 1) * 119)) * 119 + i % 2004;
}

var initReply = {
  outOfDate: 1,
  ok: 2,
  banned: 3,
  fileMap: 4,
  fileEIF: 5,
  fileENF: 6,
  fileESF: 7,
  players: 8,
  mapMutation: 9,
  friendListPlayers: 10,
  fileECF: 11
}

var banType = {
  temp: 0,
  perm: 2
}

function init_handler(client, reader) {
	var challenge = reader.getThree();
  reader.getChar(); // ?
  reader.getChar(); // ?
  var version = reader.getChar();
  reader.getChar(); // ?
  reader.getChar(); // ?

  var hdid = Number(reader.getEndString());

  var builder = packet.builder(packet.family.INIT, packet.action.INIT);

  var response = solveChallenge(challenge);
  var emulti_e = utils.random(6, 12);
  var emulti_d = utils.random(6, 12);

  client.initNewSequence();
  var seqBytes = client.getInitSequenceBytes();

  builder.addByte(initReply.ok);
  builder.addByte(seqBytes[0]);
  builder.addByte(seqBytes[1]);
  builder.addByte(emulti_e);
  builder.addByte(emulti_d);
  builder.addShort(0);
  builder.addThree(response);

  client.processor.setEMulti(emulti_e, emulti_d);
  client.write(builder);
  client.state = client.clientState.Initialized;

  // TODO: handled banned
  // builder.addByte(3);
  // builder.addByte(2);
  // client.write(builder);
  // client.close();

}

module.exports = init_handler;
