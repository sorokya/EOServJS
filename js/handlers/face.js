/*
 * face.js
 * handles face packet
 */

var structs = require('../structs.js');

function face_handler(character, reader) {
    var direction = reader.getChar();
    
    if (character.sitting !== structs.sitState.stand) {
        return;
    }
    
    if (direction <= 3) {
        character.map.face(character, direction);
    }
}

module.exports = face_handler;