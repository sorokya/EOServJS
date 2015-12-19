/*
 * world.js - handles all maps and charcters on the server
 */

var data = require('./data.js');
var utils = require('./utils.js');
var player = require('./player.js');

var characters = [];
var parties = [];
var maps = [];
var homes = [];
var quests = [];
var board = [];
var expTable = [];
var instrumentIds = [];

var lastCharacterCount = 0;
var adminCount = 0;

module.exports = function(server) {
  return {
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
      return ++lastCharacterCount;
    },
    login: function(username) {
      return player(username);
    },
    logout: function(username) {
      var client = server.clients.filter(function(c) {
        return c.player.username === username && c.player.online;
      })[0];

      if (client) {
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
}
