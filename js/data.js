/*
 * data.js - handles saving/loading accounts/characters/guilds/bans/reports
 */

var fs = require('fs');
var utils = require('./utils.js')

function data() {
  var users = [];
  var guilds = [];

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

  // NOTE(sorokya): create data directories if they don't exist
  checkDirectory('db');
  checkDirectory('db/users');
  checkDirectory('db/guilds');
  checkDirectory('db/bans');

  function newUser() {
    return {
      account: {
        username: '',
        password: '',
        realname: '',
        location: '',
        email: ''
      },
      characters: [
      ]
    }
  }
  
  function newCharacter() {
    return {
      'name': '',
      'title': '',
      'home': '',
      'fiance': '',
      'partner': '',
      'admin': 0,
      'class': 0,
      'gender': 0,
      'race': 0,
      'hairstyle': 0,
      'haircolor': 0,
      'map': 1,
      'x': 1,
      'y': 1,
      'direction': 2,
      'level': 0,
      'exp': 0,
      'hp': 10,
      'tp': 10,
      'str': 0,
      'int': 0,
      'wis': 0,
      'agi': 0,
      'con': 0,
      'cha': 0,
      'statpoints': 0,
      'skillpoints': 0,
      'karma': 1000,
      'sitting': 0,
      'hidden': 0,
      'nointeract': 0,
      'bankmax': 0,
      'goldbank': 0,
      'usage': 0,
      'inventory': '',
      'bank': '',
      'paperdoll': '',
      'spells': '',
      'guild': '',
      'guild_rank': 0,
      'guild_rank_string': '',
      'quest': '',
      'vars': ''
    }
  }

  function loadUsers() {
    var files = fs.readdirSync('./db/users');

    utils.forEach(files, function (path) {
      var data = fs.readFileSync('./db/users/' + path);
      var user = JSON.parse(data.toString());
      
      user.save = function() {
        // TODO: save data
      }
      
      users.push(user);
    });
  }

  loadUsers();

  return {
    users: users,
    guilds: guilds,
    getCharacterCount: function() {
      var count = 0;
      utils.forEach(users, function(u) {
        if (u.characters)
          count += u.characters.length;
      });
      
      return count;
    }
  }
}

module.exports = data();
