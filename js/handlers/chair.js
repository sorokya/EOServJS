/*
 * chair.js
 * handles chair packet
 */

var packet = require('../packet.js');
var structs = require('../structs.js');
var utils = require('../utils.js');

function chair_handler(character, reader) {
    var action = reader.getChar();
    var reply;
    
    if (action === structs.sitAction.sit && character.sitting === structs.sitState.stand) {
        var x = reader.getChar();
        var y = reader.getChar();
        var valid = true;
        
        // NOTE: make sure chair is only one tile away
        if ((x + y - character.x - character.y) > 1) {
            valid = false;
        }
        
        // NOTE: check if chair is empty
        utils.forEach(character.map.characters, function(char) {
            if (char.x === x && char.y === y) {
                valid = false;
            }
        });
        
        if (!valid) {
            return;
        }
        
        switch (character.map.getTile(x, y).tilespec) {
            case structs.tileSpec.chairDown:
                if (character.y === y + 1 && character.x === x) {
                    character.direction = structs.direction.DOWN;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairLeft:
                if (character.y === y && character.x === x - 1) {
                    character.direction = structs.direction.LEFT;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairRight:
                if (character.y === y && character.x === x + 1) {
                    character.direction = structs.direction.RIGHT;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairUp:
                if (character.y === y - 1 && character.x === x) {
                    character.direction = structs.direction.UP;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairDownRight:
                if (character.y === y && character.x === x + 1) {
                    character.direction = structs.direction.RIGHT;
                } else if (character.y === y + 1 && character.x === x) {
                    character.direction = structs.direction.DOWN;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairUpLeft:
                if (character.y === y - 1 && character.x === x) {
                    character.direction = structs.direction.UP;
                } else if (character.y === y && character.x === x - 1) {
                    character.direction = structs.direction.LEFT;
                } else {
                    return;
                }
                break;
            case structs.tileSpec.chairAll:
                if (character.y === y + 1 && character.x === x) {
                    character.direction = structs.direction.DOWN;
                } if (character.y === y && character.x === x - 1) {
                    character.direction = structs.direction.LEFT;
                } else if (character.y === y && character.x === x + 1) {
                    character.direction = structs.direction.RIGHT;
                } else if (character.y === y - 1 && character.x === x) {
                    character.direction = structs.direction.UP;
                } else {
                    return;
                }
                break;
            default:
                return;
        }
        
        character.x = x;
        character.y = y;
        
        reply = packet.builder(packet.family.CHAIR, packet.action.PLAYER);
        reply.addShort(character.playerID());
        reply.addChar(character.x);
        reply.addChar(character.y);
        reply.addChar(character.direction);
        reply.addChar(0); // ?
        character.send(reply);
        character.sit(structs.sitState.chair);
    } else if (action === structs.sitAction.stand && character.sitting === structs.sitState.chair) {
        switch (character.direction) {
            case structs.direction.DOWN:
                ++character.y;
                break;
            case structs.direction.LEFT:
                --character.x;
                break;
            case structs.direction.UP:
                --character.y;
                break;
            case structs.direction.RIGHT:
                ++character.x;
                break;
        }
        
        reply = packet.builder(packet.family.CHAIR, packet.action.CLOSE);
        reply.addShort(character.playerID());
        reply.addChar(character.x);
        reply.addChar(character.y);
        character.send(reply);
        character.stand();
    }
}

module.exports = chair_handler;