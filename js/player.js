/*
 * player.js
 */

var data = require('./data.js');
var utils = require('./utils.js');
var character = require('./character.js');

module.exports = function(username) {
  var user = data.users.filter(function(u) {
      return u.account.username === username;
  })[0];

  return {
    username: username,
    loginTime: 0,
    online: true,
    id: null,
    characters: [],
    character: null,
    client: null,
    admin: null,
    world: null,
    addCharacter: function (name, gender, hairStyle, hairColor, race) {
      var charData = data.newCharacter(name, gender, hairStyle, hairColor, race);
      var new_character = character(charData, this.world, user);
      user.characters.push(charData);
      user.save();
      new_character.player = this;
      this.characters.push(new_character);
    },
    validName: function (name) {
      for(var i = 0; i < name.length; i++) {
        if (!(name[i] >= 'a' && name[i] <= 'z') || name[i] === ' ' || (name[i] >= '0' && name[i] <= '9')) {
          return false;
        }
      }

      return true;
    },
    send: function (builder) {
      this.client.send(builder);
    },
    setClient: function (c) {
      var player = this;
      player.client = c;
      player.world = c.server.world;

      // NOTE(sorokya): load characters after client is set
      if (user.characters.length > 0) {
        utils.forEach(user.characters, function(char) {
          var _char = character(char, player.world, user);
          _char.player = player;
          player.characters.push(_char);
        });
      }
    }
  }
}
