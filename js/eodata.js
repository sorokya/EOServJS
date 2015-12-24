/*
 * eodata.js - loads/stores pub file data
 */

var fs = require('fs');
var utils = require('./utils.js');
var packet = require('./packet.js');
var processor = packet.processor();

function checkDirectory(path) {
  fs.stat('./' + path, function(err, stats) {
    if(err) {
      console.log('Error checking directory: ' + path);
    }

    if(!stats) {
      fs.mkdir('./' + path);
    }
  });
}

checkDirectory('data');
checkDirectory('data/pub');

var EIF = function () {
  var data = [];
  var rid = [];
  var len = [];

  try {
    var stats = fs.statSync('./data/pub/dat001.eif');
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync('./data/pub/dat001.eif')).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push(null); // first item is null

      for (var i = 1; i <= numObj; i++) {
        var sizeOfName = packet.packEOInt(fData.splice(0, 1)[0].charCodeAt());
        var name = fData.splice(0, sizeOfName).join('');

        var buf = fData.splice(0, 58);

        data.push({
          id: i,
          name: name,

          graphic: packet.packEOInt(buf[0].charCodeAt(), buf[1].charCodeAt()),
          type: packet.packEOInt(buf[2].charCodeAt()),
          subType: packet.packEOInt(buf[3].charCodeAt()),

          special: packet.packEOInt(buf[4].charCodeAt()),
          hp: packet.packEOInt(buf[5].charCodeAt(), buf[6].charCodeAt()),
          tp: packet.packEOInt(buf[7].charCodeAt(), buf[8].charCodeAt()),
          minDam: packet.packEOInt(buf[9].charCodeAt(), buf[10].charCodeAt()),
          maxDam: packet.packEOInt(buf[11].charCodeAt(), buf[12].charCodeAt()),
          accuracy: packet.packEOInt(buf[13].charCodeAt(), buf[14].charCodeAt()),
          evade: packet.packEOInt(buf[15].charCodeAt(), buf[16].charCodeAt()),
          armor: packet.packEOInt(buf[17].charCodeAt(), buf[18].charCodeAt()),

          str: packet.packEOInt(buf[20].charCodeAt()),
          intl: packet.packEOInt(buf[21].charCodeAt()),
          wis: packet.packEOInt(buf[22].charCodeAt()),
          agi: packet.packEOInt(buf[23].charCodeAt()),
          con: packet.packEOInt(buf[24].charCodeAt()),
          cha: packet.packEOInt(buf[25].charCodeAt()),

          light: packet.packEOInt(buf[26].charCodeAt()),
          dark: packet.packEOInt(buf[27].charCodeAt()),
          earth: packet.packEOInt(buf[28].charCodeAt()),
          air: packet.packEOInt(buf[29].charCodeAt()),
          water: packet.packEOInt(buf[30].charCodeAt()),
          fire: packet.packEOInt(buf[31].charCodeAt()),

          scrollMap: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          scrollX: packet.packEOInt(buf[35].charCodeAt()),
          scrollY: packet.packEOInt(buf[36].charCodeAt()),

          levelReq: packet.packEOInt(buf[37].charCodeAt(), buf[38].charCodeAt()),
          classReq: packet.packEOInt(buf[39].charCodeAt(), buf[40].charCodeAt()),

          strReq: packet.packEOInt(buf[41].charCodeAt(), buf[42].charCodeAt()),
          intReq: packet.packEOInt(buf[43].charCodeAt(), buf[44].charCodeAt()),
          wisReq: packet.packEOInt(buf[45].charCodeAt(), buf[46].charCodeAt()),
          agiReq: packet.packEOInt(buf[47].charCodeAt(), buf[48].charCodeAt()),
          conReq: packet.packEOInt(buf[49].charCodeAt(), buf[50].charCodeAt()),
          chaReq: packet.packEOInt(buf[51].charCodeAt(), buf[52].charCodeAt()),

          weight: packet.packEOInt(buf[55].charCodeAt()),

          size: packet.packEOInt(buf[57].charCodeAt())
        });
      }

      if (data[data.length - 1].name === 'eof') {
        data.pop();
      }

      console.log(data.length + ' items loaded');
    }
  } catch (e) {
    console.log('ERROR: can not read dat001.eif');
  }
  
  for (var i = 0; i < rid.length; i++) {
    rid[i] = rid[i].charCodeAt();
  }
  
  for (var i = 0; i < len.length; i++) {
    len[i] = len[i].charCodeAt();
  }

  return {
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[i];
      } else {
        return data[0];
      }
    }
  }
}

var ENF = function () {
  var data = [];
  var rid = [];
  var len = [];

  try {
    var stats = fs.statSync('./data/pub/dtn001.enf');
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync('./data/pub/dtn001.enf')).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push(null); // first item is null

      for (var i = 1; i <= numObj; i++) {
        var sizeOfName = packet.packEOInt(fData.splice(0, 1)[0].charCodeAt());
        var name = fData.splice(0, sizeOfName).join('');

        var buf = fData.splice(0, 39);

        data.push({
          id: i,
          name: name,
          graphic: packet.packEOInt(buf[0].charCodeAt(), buf[1].charCodeAt()),
          boss: packet.packEOInt(buf[3].charCodeAt(), buf[4].charCodeAt()),
          child: packet.packEOInt(buf[5].charCodeAt(), buf[6].charCodeAt()),
          type: packet.packEOInt(buf[7].charCodeAt(), buf[8].charCodeAt()),
          vendorID: packet.packEOInt(buf[9].charCodeAt(), buf[10].charCodeAt()),
          hp: packet.packEOInt(buf[11].charCodeAt(), buf[12].charCodeAt(), buf[13].charCodeAt()),
          minDam: packet.packEOInt(buf[16].charCodeAt(), buf[17].charCodeAt()),
          maxDam: packet.packEOInt(buf[18].charCodeAt(), buf[19].charCodeAt()),
          accuracy: packet.packEOInt(buf[20].charCodeAt(), buf[21].charCodeAt()),
          evade: packet.packEOInt(buf[22].charCodeAt(), buf[23].charCodeAt()),
          armor: packet.packEOInt(buf[24].charCodeAt(), buf[25].charCodeAt()),
          exp: packet.packEOInt(buf[36].charCodeAt(), buf[37].charCodeAt())
        });
      }

      if (data[data.length - 1].name === 'eof') {
        data.pop();
      }

      console.log(data.length + ' npcs loaded');
    }
  } catch (e) {
    console.log('ERROR: can not read dtn001.enf');
  }
  
  for (var i = 0; i < rid.length; i++) {
    rid[i] = rid[i].charCodeAt();
  }
  
  for (var i = 0; i < len.length; i++) {
    len[i] = len[i].charCodeAt();
  }

  return {
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[i];
      } else {
        return data[0];
      }
    }
  }
}

var ESF = function () {
  var data = [];
  var rid = [];
  var len = [];

  try {
    var stats = fs.statSync('./data/pub/dsl001.esf');
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync('./data/pub/dsl001.esf')).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push(null); // first item is null

      for (var i = 1; i <= numObj; i++) {
        var sizeOfName = packet.packEOInt(fData.splice(0, 1)[0].charCodeAt());
        var sizeOfShout = packet.packEOInt(fData.splice(0, 1)[0].charCodeAt());

        var name = fData.splice(0, sizeOfName).join('');
        var shout = fData.splice(0, sizeOfShout).join('');

        var buf = fData.splice(0, 51);

        if (buf.length > 3) {
          data.push({
            id: i,
            name: name,
            shout: shout,
            icon: packet.packEOInt(buf[0].charCodeAt(), buf[1].charCodeAt()),
            graphic: packet.packEOInt(buf[2].charCodeAt(), buf[3].charCodeAt()),
            tp: packet.packEOInt(buf[4].charCodeAt(), buf[5].charCodeAt()),
            sp: packet.packEOInt(buf[6].charCodeAt(), buf[7].charCodeAt()),
            castTime: packet.packEOInt(buf[8].charCodeAt()),
            type: packet.packEOInt(buf[11].charCodeAt()),
            targetRestrict: packet.packEOInt(buf[17].charCodeAt()),
            target: packet.packEOInt(buf[18].charCodeAt()),
            minDam: packet.packEOInt(buf[23].charCodeAt(), buf[24].charCodeAt()),
            maxDam: packet.packEOInt(buf[25].charCodeAt(), buf[26].charCodeAt()),
            accuracy: packet.packEOInt(buf[27].charCodeAt(), buf[28].charCodeAt()),
            hp: packet.packEOInt(buf[34].charCodeAt(), buf[35].charCodeAt())
          });
        }
      }

      if (data[data.length - 1].name === 'eof') {
        data.pop();
      }

      console.log(data.length + ' spells loaded');
    }
  } catch (e) {
    console.log('ERROR: can not read file dsl001.esf');
  }
  
  for (var i = 0; i < rid.length; i++) {
    rid[i] = rid[i].charCodeAt();
  }
  
  for (var i = 0; i < len.length; i++) {
    len[i] = len[i].charCodeAt();
  }

  return {
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[i];
      } else {
        return data[0];
      }
    }
  }
}

var ECF = function () {
  var data = [];
  var rid = [];
  var len = [];

  try {
    var stats = fs.statSync('./data/pub/dat001.ecf');
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync('./data/pub/dat001.ecf')).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push(null); // first item is null

      for (var i = 1; i <= numObj; i++) {
        var sizeOfName = packet.packEOInt(fData.splice(0, 1)[0].charCodeAt());
        var name = fData.splice(0, sizeOfName).join('');

        var buf = fData.splice(0, 14);

        data.push({
          id: i,
          name: name,
          base: packet.packEOInt(buf[0].charCodeAt()),
          type: packet.packEOInt(buf[1].charCodeAt()),
          str: packet.packEOInt(buf[2].charCodeAt(), buf[3].charCodeAt()),
          intl: packet.packEOInt(buf[4].charCodeAt(), buf[5].charCodeAt()),
          wis: packet.packEOInt(buf[6].charCodeAt(), buf[7].charCodeAt()),
          agi: packet.packEOInt(buf[8].charCodeAt(), buf[9].charCodeAt()),
          con: packet.packEOInt(buf[10].charCodeAt(), buf[11].charCodeAt()),
          cha: packet.packEOInt(buf[12].charCodeAt(), buf[13].charCodeAt())
        });
      }

      if (data[data.length - 1].name === 'eof') {
        data.pop();
      }

      console.log(data.length + ' classes loaded');
    }
  } catch (e) {
    console.log('ERROR: can not read file dat001.ecf');
  }
  
  for (var i = 0; i < rid.length; i++) {
    rid[i] = rid[i].charCodeAt();
  }
  
  for (var i = 0; i < len.length; i++) {
    len[i] = len[i].charCodeAt();
  }

  return {
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[i];
      } else {
        return data[0];
      }
    }
  }
}

module.exports = function() {
  return {
    EIF: EIF(),
    ECF: ECF(),
    ESF: ESF(),
    ENF: ENF()
  }
}
