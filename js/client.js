var packet = require('./packet.js');
var init_handler = require('./handlers/init.js');
var login_handler = require('./handlers/login.js');
var account_handler = require('./handlers/account.js');
var utils = require('./utils.js');

module.exports = function(socket) {
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

  var state, packet_state, version, seq_start;

  // packet processor
  var processor = packet.processor();

  function initialize() {

  }

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

    state: state,
    packet_state: packet_state,
    version: version,
    processor: processor,

    initNewSequence: initNewSequence,
    getInitSequenceBytes: getInitSequenceBytes,
    write: function(builder) {
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
      default:
        break;
    }
  });

  socket.on('error', function(err) {
    
  });
}
