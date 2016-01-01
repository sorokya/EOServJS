/*
 * eodata.js - loads/stores pub file data
 */

var config = require('./config.js');
var fs = require('fs');
var utils = require('./utils.js');
var packet = require('./packet.js');
var processor = packet.processor();

var EIF = function () {
  var data = [];
  var rid = [];
  var len = [];

  try {
    var stats = fs.statSync(config.EIF);
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync(config.EIF)).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push({
          id: 0,
          name: '',
          
          graphic: 0,
          type: 0,
          subType: 0,
          
          special: 0,
          hp: 0,
          tp: 0,
          minDam: 0,
          maxDam: 0,
          accuracy: 0,
          evade: 0,
          armor: 0,
          
          str: 0,
          int: 0,
          wis: 0,
          agi: 0,
          con: 0,
          cha: 0,
          
          light: 0,
          dark: 0,
          earth: 0,
          air: 0,
          water: 0,
          fire: 0,
          
          scrollMap: 0,
          dollGraphic: 0,
          expReward: 0,
          hairColor: 0,
          effect: 0,
          key: 0,
          
          scrollX: 0,
          gender: 0,
          
          scrollY: 0,
          dualWieldDollGraphic: 0,
          
          levelReq: 0,
          classReq: 0,
          
          strReq: 0,
          intReq: 0,
          wisReq: 0,
          agiReq: 0,
          conReq: 0,
          chaReq: 0,
          
          weight: 0,
          size: 0
      });

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
          int: packet.packEOInt(buf[21].charCodeAt()),
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
          dollGraphic: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          expReward: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          hairColor: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          effect: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          key: packet.packEOInt(buf[32].charCodeAt(), buf[33].charCodeAt(), buf[34].charCodeAt()),
          
          scrollX: packet.packEOInt(buf[35].charCodeAt()),
          gender: packet.packEOInt(buf[35].charCodeAt()),
          
          scrollY: packet.packEOInt(buf[36].charCodeAt()),
          dualWieldDollGraphic: packet.packEOInt(buf[36].charCodeAt()),

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
    data: data,
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[id];
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
    var stats = fs.statSync(config.ENF);
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync(config.ENF)).split('');
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
    data: data,
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[id];
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
    var stats = fs.statSync(config.ESF);
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync(config.ESF)).split('');
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
    data: data,
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[id];
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
    var stats = fs.statSync(config.ECF);
    if (stats) {
      var fData = packet.bufferToStr(fs.readFileSync(config.ECF)).split('');
      fData.splice(0, 3);

      rid = fData.splice(0, 4);
      len = fData.splice(0, 2);

      var numObj = packet.packEOInt(len[0].charCodeAt(), len[1].charCodeAt());

      fData.splice(0, 1);

      data.push({
          id: 0,
          name: '',
          base: 0,
          type: 0,
          str: 0,
          int: 0,
          wis: 0,
          agi: 0,
          con: 0,
          cha: 0
      });

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
          int: packet.packEOInt(buf[4].charCodeAt(), buf[5].charCodeAt()),
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
    data: data,
    rid: rid,
    len: len,
    get: function (id) {
      if (id < data.length) {
        return data[id];
      } else {
        return data[0];
      }
    }
  }
}

// main.name = Wanderer
// main.location = 2,13,40
// level.1 = main

// aeven.name = Aeven
// aeven.location = 4,24,27
// aeven.innkeeper = 150
// aeven.question1 = How many houses are on the Aeven map?
// aeven.question2 = What is the name of the blue hair guy near Aeven square?
// aeven.question3 = How much do flowers cost at the Aeven grocery?
// aeven.answer1 = 20
// aeven.answer2 = dan
// aeven.answer3 = 120

function homes() {
    try {
        var stats = fs.statSync(config.HomeFile);
        if (stats) {
            var lines = packet.bufferToStr(fs.readFileSync(config.HomeFile)).split('\n');
            var homes = [];
            
            utils.forEach(lines, function(line) {
                if (line.trim() !== '' && line[0] !== '#') {
                    var key = line.split('=')[0];
                    var value = line.split('=')[1];
                    var homeIndex;
                    
                    if (key.indexOf('level') === 0) {
                        homeIndex = homes.indexOf(homes.filter(function(home) {
                            return home.id === value.trim();
                        })[0]);
                        
                        if (homeIndex > -1) {
                            homes[homeIndex].level = Number(key.split('.')[1].trim());
                        }
                    } else {
                        var homeID = key.split('.')[0].trim();
                        
                        homeIndex = homes.indexOf(homes.filter(function(home) {
                            return home.id === homeID;
                        })[0]);
                        
                        if (homeIndex > -1) {
                            homes[homeIndex][key.split('.')[1].trim()] = value.trim();
                        } else {
                            var home = {
                                id: homeID
                            };
                            
                            home[key.split('.')[1].trim()] = value.trim();
                            homes.push(home);
                        }
                    }
                }
            });
            
            return homes;
        }
    } catch (e) {
        console.log('ERROR: can not read homes file');
    }
}

module.exports = function() {
  return {
    EIF: EIF(),
    ECF: ECF(),
    ESF: ESF(),
    ENF: ENF(),
    homes: homes()
  }
}
