/*
 * chest.js - handles chest packet
 */

var config = require('../config.js');
var packet = require('../packet.js');
var utils = require('../utils.js');
var structs = require('../structs.js');

function chest_handler(character, reader) {
    function chest_add() {
        if (character.trading) {
            return;
        }
        
        var x = reader.getChar();
        var y = reader.getChar();
        var id = reader.getShort();
        var amount = reader.getThree();
        
        if (character.world.eif.get(id).special === structs.EIFSpecial.lore) {
            return;
        }
        
        if (utils.pathLength(character.x, character.y, x, y) <= 1) {
            if (character.map.getTile(x, y).tilespec === structs.tileSpec.chest) {
                var chest = character.map.chests.filter(function(ch) {
                    return ch.x === x && ch.y === y;
                })[0];
                
                if (chest) {
                    amount = Math.min(amount, config.MaxChest - chest.hasItem(id));
                    
                    if (character.hasItem(id) >= amount && chest.addItem(id, amount)) {
                        character.delItem(id, amount);
                        chest.update(character.map, character);
                        
                        var reply = packet.builder(packet.family.CHEST, packet.action.REPLY);
                        reply.addShort(id);
                        reply.addInt(character.hasItem(id));
                        reply.addChar(character.weight);
                        reply.addChar(character.max_weight);
                        
                        utils.forEach(chest.items, function(item) {
                            if (item.id !== 0) {
                                reply.addShort(item.id);
                                reply.addThree(item.amount);
                            } 
                        });
                        
                        character.send(reply);
                    }
                }
            }
        }
    }
    
    function chest_take() {
        var x = reader.getChar();
        var y = reader.getChar();
        var id = reader.getShort();

        if (utils.pathLength(character.x, character.y, x, y) <= 1) {
            if (character.map.getTile(x, y).tilespec === structs.tileSpec.chest) {
                var chest = character.map.chests.filter(function(ch) {
                    return ch.x === x && ch.y === y;
                })[0];
                
                if (chest) { 
                    var amount = chest.hasItem(id);
                    var taken = character.canHoldItem(id, amount);
                    
                    if (taken > 0) {
                        chest.delSomeItem(id, taken);
                        character.addItem(id, taken);
                        
                        var reply = packet.builder(packet.family.CHEST, packet.action.GET);
                        reply.addShort(id);
                        reply.addThree(taken);
                        reply.addChar(character.weight);
                        reply.addChar(character.max_weight);
                        
                        utils.forEach(chest.items, function(item) {
                            if (item.id !== 0) {
                                reply.addShort(item.id);
                                reply.addThree(item.amount);
                            } 
                        });
                        
                        character.send(reply);
                        chest.update(character.map, character);
                    }
                }
            }            
        }
    }
    
    function chest_open() {
        var x = reader.getChar();
        var y = reader.getChar();
        
        if (utils.pathLength(character.x, character.y, x, y) <= 1) {
            if (character.map.getTile(x, y).tilespec === structs.tileSpec.chest) {
                var reply = packet.builder(packet.family.CHEST, packet.action.OPEN);
                reply.addChar(x);
                reply.addChar(y);
                
                var chest = character.map.chests.filter(function(ch) {
                    return ch.x === x && ch.y === y;
                })[0];
                
                if (chest) {
                    utils.forEach(chest.items, function(item) {
                       if (item.id !== 0) {
                           reply.addShort(item.id);
                           reply.addThree(item.amount);
                       } 
                    });
                    
                    character.send(reply);
                }
            }
        }
    }    
    
    switch (reader.action) {
        case packet.action.ADD:
            chest_add();
            break;
        case packet.action.TAKE:
            chest_take();
            break;
        case packet.action.OPEN:
            chest_open();
            break;
    }
}

module.exports = chest_handler;