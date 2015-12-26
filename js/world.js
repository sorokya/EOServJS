/*
 * world.js - handles all maps and charcters on the server
 */

var data = require('./data.js');
var utils = require('./utils.js');
var player = require('./player.js');
var map = require('./map.js');
var structs = require('./structs.js');

module.exports = function(server) {
  var world = {
    characters: [],
    parties: [],
    homes: [],
    quests: [],
    boards: [],
    expTable: [],
    instrumentIds: [],
    lastCharacterCount: 0,
    adminCount: 0,
    maps: [],
    eif: null,
    enf: null,
    ecf: null,
    esf: null,
    getMap: function(id) {
      return this.maps[id];
    },
    generatePlayerID: function() {
      var lowestFreeID = 1;

      (function findNextID() {
        utils.forEach(server.clients, function(c) {
          if(c.id === lowestFreeID) {
            lowestFreeID = c.id + 1;
            findNextID();
          }
        });
      })();

      return lowestFreeID;
    },
    generateCharacterID: function() {
      return ++this.lastCharacterCount;
    },
    loginChar: function(character) {
      this.characters.push(character);
      var map = this.getMap(character.mapid);
      map.enter(character, structs.warpAnimation.none);
      character.login();
    },
    login: function(username) {
      return player(username);
    },
    logoutChar: function(character) {
        if (this.getMap(character.mapid)) {
            this.getMap(character.mapid).leave(character, structs.warpAnimation.none);
        }
        
        this.characters.splice(this.characters.indexOf(this.characters.filter(function(char) {
            return char.id === character.id;
        })[0]), 1);
    },
    logout: function(username) {
      var client = server.clients.filter(function(c) {
        return c.player && c.player.username === username && c.player.online;
      })[0];

      if (client) {
        if (client.player.character) {
            client.player.character.logout();
        }
          
        client.player.online = false;
        client.close();
      }
    },
    playerExists: function(username) {
      return server.clients.filter(function(c) {
        return c.player && c.player.username === username;
      }).length > 0;
    },
    playerOnline: function(username) {
      return server.clients.filter(function(c) {
        return c.player && c.player.username === username && c.player.online;
      }).length > 0;
    },
    characterExists: function(name) {
      var characters = [];
      utils.forEach(data.users, function(u) {
        utils.forEach(u.characters, function(c) {
          characters.push(c);
        });
      });

      return characters.filter(function(c) {
        return c.name === name;
      }).length > 0;
    },
    deleteCharacter: function(name) {
      var user = data.users.filter(function (_user) {
        return _user.characters.filter(function (char) {
          return char.name === name;
        }).length > 0
      })[0];

      if (user) {
        var char = user.characters.filter(function (char) {
          return char.name === name;
        })[0];

        if (char) {
          user.characters.splice(user.characters.indexOf(char), 1);
          user.save();
        }
      }
    }
  };
  
  for(var i = 0; i < 278; i++) {
    world.maps.push(map(i));
  }
  
  return world;
}
