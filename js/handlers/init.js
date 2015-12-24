/*
 * init.js
 * handles init packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var structs = require('../structs.js');

function solveChallenge(i) {
  ++i;
  return 110905 + (i % 9 + 1) * ((11092004 - i) % ((i % 11 + 1) * 119)) * 119 + i % 2004;
}

function init_handler(client, reader) {
	var challenge = reader.getThree();
  reader.getChar(); // ?
  reader.getChar(); // ?
  var version = reader.getChar();
  reader.getChar(); // ?
  reader.getChar(); // ?

  var hdid = Number(reader.getEndString());

  var reply = packet.builder(packet.family.INIT, packet.action.INIT);

  var response = solveChallenge(challenge);
  var emulti_e = utils.random(6, 12);
  var emulti_d = utils.random(6, 12);

  client.initNewSequence();
  var seqBytes = client.getInitSequenceBytes();

  reply.addByte(structs.initReply.ok);
  reply.addByte(seqBytes[0]);
  reply.addByte(seqBytes[1]);
  reply.addByte(emulti_e);
  reply.addByte(emulti_d);
  reply.addShort(client.id);
  reply.addThree(response);

  client.processor.setEMulti(emulti_e, emulti_d);
  client.send(reply);
  client.state = client.clientState.Initialized;

  // TODO: handled banned
  // builder.addByte(3);
  // builder.addByte(2);
  // client.write(builder);
  // client.close();
}

module.exports = init_handler;
