var MAX1 = 253;
var MAX2 = 64009;
var MAX3 = 16194277;

var family = {
  CONNECTION: 1,
  ACCOUNT: 2,
  CHARACTER: 3,
  LOGIN: 4,
  WELCOME: 5,
  WALK: 6,
  FACE: 7,
  CHAIR: 8,
  EMOTE: 9,
  ATTACK: 11,
  SPELL: 12,
  SHOP: 13,
  ITEM: 14,
  STATSKILL: 16,
  GLOBAL: 17,
  TALK: 18,
  WARP: 19,
  JUKEBOX: 21,
  PLAYERS: 22,
  CLOTHES: 23,
  PARTY: 24,
  REFRESH: 25,
  NPC: 26,
  AUTOREFRESH: 27,
  APPEAR: 29,
  PAPERDOLL: 30,
  EFFECT: 31,
  TRADE: 32,
  CHEST: 33,
  DOOR: 34,
  PING: 35,
  BANK: 36,
  LOCKER: 37,
  BARBER: 38,
  GUILD: 39,
  SIT: 41,
  RECOVER: 42,
  BOARD: 43,
  CAST: 44,
  ARENA: 45,
  PRIEST: 46,
  LAW: 47,
  ADMININTERACT: 48,
  CITIZEN: 49,
  QUEST: 50,
  BOOK: 51,
  INIT: 255
}

var action = {
  REQUEST: 1,
  REPLY: 3,
  REMOVE: 4,
  AGREE: 5,
  CREATE: 6,
  ADD: 7,
  PLAYER: 8,
  TAKE: 9,
  USE: 10,
  BUY: 11,
  SELL: 12,
  OPEN: 13,
  CLOSE: 14,
  MSG: 15,
  SPEC: 16,
  ADMIN: 17,
  LIST: 18,
  TELL: 20,
  REPORT: 21,
  ANNOUNCE: 22,
  SERVER: 23,
  DROP: 24,
  JUNK: 25,
  GET: 27,
  KICK: 28,
  RANK: 29,
  EXP: 33,
  NET: 240,
  NET2: 241,
  NET3: 242,
  INIT: 255
}

function bufferToStr(buff) {
  var ret = '';

  for(var i = 0; i < buff.length; i++) {
      ret += String.fromCharCode(buff[i]);
  }

  return ret;
}

function packEOInt(b1, b2, b3, b4) {
  function checkByte(b) {
    if(b === 254) {
      b = 1;
    }

    if(b === 0) {
      b = 128;
    }

    --b;
    return b;
  }

  b1 = checkByte(b1);
  b2 = checkByte(b2);
  b3 = checkByte(b3);
  b4 = checkByte(b4);

  return (b4 * MAX3) + (b3 * MAX2) + (b2 * MAX1) + b1
}

function unpackEOInt(num) {
  var bytes = [254, 254, 254, 254];
  var oNum = num;

  if (oNum >= MAX3) {
    bytes[3] = num / MAX3 + 1;
    num = num % MAX3;
  }

  if (oNum >= MAX2) {
    bytes[2] = num / MAX2 + 1;
    num = num % MAX2;
  }

  if (oNum >= MAX1) {
    bytes[1] = num / MAX1 + 1;
    num = num % MAX1;
  }

  bytes[0] = num + 1;

  return bytes;
}

function PID(fam, act) {
  return (fam & 0xFF) | ((act & 0xFF) << 8)
}

function EPID(pid) {
  return [pid & 0xFF, pid >> 8];
}

function processor() {
  var emulti_e = 0;
  var emulti_d = 0;

  function getFamilyName(fam) {

  }

  function getActionName(act) {

  }

  function decode(str) {
    if(emulti_d === 0 || str[2].charCodeAt() === family.INIT && str[3].charCodeAt() === action.INIT) {
      return str;
    }
    
    var packetLength = str.substr(0, 2);

    str = str.substr(2); // cut off the length

    var newStr = [];
    var length = str.length;
    var i = 0;
    var ii = 0;

    while (i < length) {
      newStr[ii++] = String.fromCharCode(str[i].charCodeAt() ^ 0x80);
      i += 2;
    }

    --i;

    if (length % 2) {
      i -= 2;
    }

    do {
      newStr[ii++] = String.fromCharCode(str[i].charCodeAt() ^ 0x80);
      i -= 2;
    }
    while(i >= 0);

    for (var q = 2; q < length; ++q) {
      if (newStr[q].charCodeAt() === 128) {
        newStr[q] = String.fromCharCode(0);
      } else if(newStr[q].charCodeAt() === 0) {
        newStr[q] = String.fromCharCode(128);
      }
    }

    return dickWinderD(newStr.join(''));
  }

  function encode(rawstr) {
    if(emulti_e === 0 || rawstr[2].charCodeAt() === family.INIT && rawstr[3].charCodeAt() === action.INIT) {
      return rawstr;
    }

    var str = dickWinderE(rawstr);
    var newStr = [];

    var length = str.length;
    var i = 2;
    var ii = 2;

    newStr[0] = str[0];
    newStr[1] = str[1];

    while(i < length) {
      newStr[i] = String.fromCharCode(str[ii++].charCodeAt() ^ 0x80);
      i += 2;
    }

    i = length - 1;

    if (length % 2) {
      --i;
    }

    while (i >= 2) {
      newStr[i] = String.fromCharCode(str[ii++].charCodeAt() ^ 0x80)
      i -= 2;
    }

    for (var q = 2; q < length; ++q) {
      if(newStr[q].charCodeAt() === 128) {
        newStr[q] = String.fromCharCode(0);
      } else if (newStr[q].charCodeAt() === 0) {
        newStr[q] = String.fromCharCode(128);
      }
    }

    return newStr.join('');
  }

  function dickWinder(str, emulti) {
    var newStr = '';
    var length = str.length;
    var buffer = [];
    var c;

    if (emulti === 0) {
      return str;
    }

    for (var i = 0; i < length; i++) {
      c = str[i].charCodeAt();

      if(c % emulti === 0) {
        buffer.push(c);
      } else {
        if(buffer.length > 0) {
          buffer.reverse();

          for(var q = 0; q < buffer.length; q++) {
            newStr += String.fromCharCode(buffer[q]);
          }

          buffer = [];
        }

        newStr += String.fromCharCode(c);
      }
    }

    if(buffer.length > 0) {
      buffer.reverse();

      for(var q = 0; q < buffer.length; q++) {
        newStr += String.fromCharCode(buffer[q]);
      }
    }

    return newStr;
  }

  function dickWinderE(str) {
    return dickWinder(str, emulti_e);
  }

  function dickWinderD(str) {
    return dickWinder(str, emulti_d);
  }

  function setEMulti(e, d) {
    emulti_e = e;
    emulti_d = d;
  }

  return {
    getFamilyName: getFamilyName,
    getActionName: getActionName,
    decode: decode,
    encode: encode,
    dickWinder: dickWinder,
    dickWinderE: dickWinderE,
    dickWinderD: dickWinderD,
    setEMulti: setEMulti
  }
}

function packetBuilder(fam, act) {
  var id = PID(fam, act);
  var data = '';

  function addByte(byte) {
    data += String.fromCharCode(byte);
  }

  function addChar(num) {
    data += String.fromCharCode(unpackEOInt(num)[0]);
  }

  function addShort(num) {
    var bytes = unpackEOInt(num);
    data += String.fromCharCode(bytes[0]);
    data += String.fromCharCode(bytes[1]);
  }

  function addThree(num) {
    var bytes = unpackEOInt(num);
    data += String.fromCharCode(bytes[0]);
    data += String.fromCharCode(bytes[1]);
    data += String.fromCharCode(bytes[2]);
  }

  function addInt(num) {
    var bytes = unpackEOInt(num);
    data += String.fromCharCode(bytes[0]);
    data += String.fromCharCode(bytes[1]);
    data += String.fromCharCode(bytes[2]);
    data += String.fromCharCode(bytes[3]);
  }

  function addVar(min, max, num) {
    if (min <= 1 && (max <= 1 || num < MAX1)) {
      addChar(num);
    } else if (min <= 2 && (max <= 2 || num < MAX2)) {
      addShort(num);
    } else if (min <= 3 && (max <= 3 || num < MAX3)) {
      addThree(num);
    } else {
      addInt(num);
    }
  }

  function addString(str) {
    data += str;
  }

  function addBreakString(str) {
    data += str + String.fromCharCode(255);
  }

  function get() {
    var retData = '';
    var length = unpackEOInt(data.length + 2);

    retData += String.fromCharCode(length[0]);
    retData += String.fromCharCode(length[1]);
    retData += String.fromCharCode(act);
    retData += String.fromCharCode(fam);
    retData += data;

    return retData;
  }

  return {
    data: data,
    family: fam,
    action: act,
    addByte: addByte,
    addChar: addChar,
    addShort: addShort,
    addThree: addThree,
    addInt: addInt,
    addString: addString,
    addBreakString: addBreakString,
    get: get
  }
}

function packetReader(d) {
  var data = d[1].charCodeAt() === 254 ? d.slice(2) : d;
  var pAction = data[0].charCodeAt();
  var pFamily = data[1].charCodeAt();
  var pos = 2;

  function remaining() {
    return data.length - pos;
  }

  function getNumber(length) {
    var bytes = [];
    for(var i = pos; i < pos + length; i++) {
      bytes.push(data[i].charCodeAt());
    }

    while(bytes.length < 4) { bytes.push(254); }

    pos += length;

    return packEOInt(bytes[0], bytes[1], bytes[2], bytes[3])
  }

  function getByte() {
    if(remaining() < 1){
      return 0;
    }

    var ret = data[pos];
    pos++;

    return ret;
  }

  function getChar() {
    return getNumber(1);
  }

  function getShort() {
    return getNumber(2);
  }

  function getThree() {
    return getNumber(3);
  }

  function getInt() {
    return getNumber(4);
  }

  function getFixedString(length) {
    if (remaining() < length) {
      return '';
    }

    var ret = data.substr(pos, length)
    pos += ret.length;

    return ret;
  }

  function getBreakString() {
    var length = data.indexOf(String.fromCharCode(255), pos);
    var ret = getFixedString(length - pos);
    pos += 1;
    return ret;
  }

  function getEndString() {
    return getFixedString(remaining());
  }

  return {
    family: pFamily,
    action: pAction,
    getByte: getByte,
    getChar: getChar,
    getShort: getShort,
    getThree: getThree,
    getInt: getInt,
    getFixedString: getFixedString,
    getBreakString: getBreakString,
    getEndString: getEndString
  };
}

module.exports = {
  family: family,
  action: action,
  reader: packetReader,
  builder: packetBuilder,
  processor: processor,
  packEOInt: packEOInt,
  unpackEOInt: unpackEOInt,
  bufferToStr: bufferToStr,
  PID: PID,
  EPID: EPID
};
