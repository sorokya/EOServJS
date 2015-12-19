/*
 * player.js
 */

var data = require('./data.js');
var utils = require('./utils.js');

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
      var character = data.newCharacter(name, gender, hairStyle, hairColor, race);
      user.characters.push(character);
      user.save();
      character.id = this.world.generateCharacterID();
      this.characters.push(character);
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
          char.id = player.world.generateCharacterID();
          player.characters.push(char);
        });
      }
    }
  }
}
