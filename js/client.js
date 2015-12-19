var packet = require('./packet.js');
var init_handler = require('./handlers/init.js');
var login_handler = require('./handlers/login.js');
var account_handler = require('./handlers/account.js');
var character_handler = require('./handlers/character.js');
var utils = require('./utils.js');

module.exports = function(server, socket) {
  var clientState = {
    Uninitialized: 0,
    Initialized: 1,
    LoggedIn: 2,
    Playing: 3
  }

  var packetState = {
    ReadLen1: 0,
    ReadLen2: 1,
    ReadData: 2
  }

  var seq_start = 0;

  // packet processor
  var processor = packet.processor();

  function initNewSequence() {
    seq_start = utils.random(0, 1757);
  }

  function getInitSequenceBytes() {
    var s1_max = (seq_start + 13) / 7;
    var s1_min = Math.max(0, (seq_start - 252 + 13 + 6) / 7);
    var s1 = utils.random(s1_min, s1_max);
    var s2 = seq_start - s1 * 7 + 13;

    return [s1, s2];
  }

  var client = {
    clientState: clientState,
    packetState: packetState,

    id: server.world.generatePlayerID(),
    state: clientState.Uninitialized,
    packet_state: packetState.ReadLen1,
    version: 0,
    player: null,
    processor: processor,
    server: server,

    initNewSequence: initNewSequence,
    getInitSequenceBytes: getInitSequenceBytes,
    send: function(builder) {
      var data = processor.encode(builder.get());

      var buffData = [];
      for(var i = 0; i < data.length; i++) {
        buffData.push(data[i].charCodeAt());
      }

      var buff = new Buffer(buffData);
      socket.write(buff);
    },
    close: function() {
      socket.destroy();
    }
  }

  socket.on('data', function(data) {
    var decData = processor.decode(packet.bufferToStr(data));
    var reader = packet.reader(decData);

    switch(reader.family) {
      case packet.family.INIT:
        init_handler(client, reader);
        break;
      case packet.family.LOGIN:
        login_handler(client, reader);
        break;
      case packet.family.ACCOUNT:
        account_handler(client, reader);
        break;
      case packet.family.CHARACTER:
        character_handler(client.player, reader);
        break;
      default:
        break;
    }
  });

  function popClient() {
    if(client.player.online) {
      server.world.logout(client.player.username);
    }

    server.clients.slice(server.clients.indexOf(server.clients.filter(function (c) {
      return c.id === client.id;
    })[0]), 1);
  }

  socket.on('error', function(err) {
    popClient();
  });

  socket.on('end', function(err) {
    popClient();
  });

  server.clients.push(client);
}
