/*
 * emote.js
 * handles emote packet
 */

var structs = require('../structs.js');

function emote_handler(character, reader) {
    var emote = reader.getChar();
    if ((emote >= 1 && emote <= 10) || emote === structs.emote.drunk || emote === structs.emote.playful) {
        character.emote(emote, false);
    }
}

module.exports = emote_handler;