/*
 * walk.js
 * handles walk packet
 */

var structs = require('../structs.js');
var packet = require('../packet.js');

function walk_handler(character, reader) {
    function walkCommon(admin) {
        var direction = reader.getChar();
        var timeStamp = reader.getThree();
        var x = reader.getChar();
        var y = reader.getChar();
        var walkResult = structs.walkResult.fail;
        
        // TODO: enforce timestamps
        
        if (character.sitting !== structs.sitState.stand) {
            return;
        }
        
        if (direction <= 3) {
            character.npc = 0;
            character.npc_type = structs.ENFType.NPC;
            character.board = 0;
            character.jukebox_open = false;
            
            if (character.trading) {
                // TODO: cancel trade
            }
            
            walkResult = admin ? character.walkAdmin(direction) : character.walk(direction);
        }
        
        if (walkResult == structs.walkResult.fail || (walkResult == structs.walkResult.ok && (character.x !== x || character.y !== y))) {
            character.refresh();
        }
    }
    
    switch (reader.action) {
        case packet.action.ADMIN:
            walkCommon(true);
            break;
        case packet.action.PLAYER:
            walkCommon(false);
            break;
        case packet.action.SPEC:
            walkCommon(false);
            break;
    }
}

module.exports = walk_handler;