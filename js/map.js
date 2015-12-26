/*
 * map.js - loads/handles eo map files
 */

var fs = require('fs');
var packet = require('./packet.js');
var utils = require('./utils.js');
var structs = require('./structs.js');

function mapItem(uid, id, amount, x, y, owner, unProtectTime) {
    return {
        uid: uid,
        id: id,
        amount: amount,
        x: x,
        y: y,
        owner: owner,
        unProtectTime: unProtectTime
    }
}

function mapWarp() {
    return {
        map: 0,
        x: 0,
        y: 0,
        levelReq: 0
    }
}

function Map(id, world) {
    var map = {
        id: id,
        world: world,
        exists: false,
        jukebox_protect: 0.0,
        jukebox_player: '',
        arena: 0,
        evacuate_lock: false,
        has_timed_spikes: false,
        characters: [],
        npcs: [],
        chests: [],
        items: [],
        tiles: [],
        rid: [],
        pk: false,
        effect: 0,
        width: 0,
        height: 0,
        scroll: 0,
        relogX: 0,
        relogY: 0,
        filesize: 0,
        inBounds: function(x, y) {
            return !(x >= this.width || y >= this.height);
        },
        walkable: function(x, y, npc) {
            if (!this.inBounds(x, y) || !this.getTile(x, y).walkable(npc)) {
                return false;
            }  
            
            return true;
        },
        enter: function(character, animation) {
            this.characters.push(character);
            character.map = this;
            character.attacks = 0;
            
            var builder = packet.builder(packet.family.PLAYERS, packet.action.AGREE);
            builder.addByte(255);
            builder.addBreakString(character.name);
            builder.addShort(character.playerID());
            builder.addShort(character.mapid);
            builder.addShort(character.x);
            builder.addShort(character.y);
            builder.addChar(character.direction);
            builder.addChar(6); // ?
            builder.addString(character.paddedGuildTag());
            builder.addChar(character.level);
            builder.addChar(character.gender);
            builder.addChar(character.hairStyle);
            builder.addChar(character.hairColor);
            builder.addChar(character.race);
            builder.addShort(character.max_hp);
            builder.addShort(character.hp);
            builder.addShort(character.max_tp);
            builder.addShort(character.tp);
            character.addPaperdollData(builder, 'B000A0HSW');
            builder.addChar(character.sitting);
            builder.addChar(character.hidden);
            builder.addChar(animation);
            builder.addByte(255);
            builder.addChar(1); // 0 = NPC, 1 = player
            
            utils.forEach(this.characters, function (_char) {
                if (_char !== character && character.charInRange(_char)) {
                    _char.send(builder);
                }
            });
        },
        leave: function(character, animation, silent) {
            if (!silent) {
                var builder = packet.builder(packet.family.AVATAR, packet.action.REMOVE);
                builder.addShort(character.playerID());
                
                if (animation !== structs.warpAnimation.none) {
                    builder.addChar(animation);
                }
                
                utils.forEach(this.characters, function(char) {
                    if (char !== character && character.charInRange(char)) {
                        char.send(builder);
                    } 
                });
            }
            
            this.characters.splice(this.characters.indexOf(this.characters.filter(function(char) {
                return char.id === character.id;
            })[0]), 1);
            
            character.map = null;
        },
        face: function (character, direction) {
            character.direction = direction;
            // character.cancelSpell();  
            
            var builder = packet.builder(packet.family.FACE, packet.action.PLAYER);
            builder.addShort(character.playerID());
            builder.addChar(direction);
            
            utils.forEach(this.characters, function(char) {
                if (char !== character && character.charInRange(char)) {
                    char.send(builder);
                } 
            });
        },
        walk: function(character, direction, admin) {
            var seeDistance = 11;
            var targetX = character.x;
            var targetY = character.y;
            
            switch(direction) {
                case structs.direction.UP:
                    targetY -= 1;
                    
                    if (targetY > character.y) {
                        return;
                    }
                    break;
                case structs.direction.RIGHT:
                    targetX += 1;
                    
                    if (targetX < character.x) {
                        return;
                    }
                    break;
                case structs.direction.DOWN:
                    targetY += 1;
                    
                    if (targetY < character.y) {
                        return;
                    }
                    break;
                case structs.direction.LEFT:
                    targetX -= 1;
                    
                    if (targetX > character.x) {
                        return;
                    }
                    break;
            }
            
            if (!this.inBounds(targetX, targetY)) {
                return structs.walkResult.fail;
            }
            
            if (!admin) {
                if (!this.walkable(targetX, targetY)) {
                    return structs.walkResult.fail;
                }
                
                // if (this.occupied) TODO: ghosts
            }
            
            // TODO: handle warps
            
            character.last_walk = 0; // TODO: actual last walk
            character.attacks = 0;
            character.cancelSpell();
            character.direction = direction;
            character.x = targetX;
            character.y = targetY;
            
            var newx;
            var newy;
            var oldx;
            var oldy;
            
            var newCoords = [];
            var oldCoords = [];
            
            var newChars = [];
            var oldChars = [];
            var newNPCs = [];
            var oldNPCs = [];
            var newItems = [];
            
            switch(direction) {
                case structs.direction.UP:
                    for (var i = -seeDistance; i < seeDistance; i++) {
                        newy = character.y - seeDistance + Math.abs(i);
                        newx = character.x + i;
                        oldy = character.y + seeDistance + 1 - Math.abs(i);
                        oldx = character.x + i;
                        
                        newCoords.push({
                            x: newx,
                            y: newy
                        });
                        
                        oldCoords.push({
                            x: oldx,
                            y: oldy
                        });
                    }
                    break;
                case structs.direction.RIGHT:
                    for (var i = -seeDistance; i < seeDistance; i++) {
                        newy = character.y + i;
                        newx = character.x + seeDistance - Math.abs(i);
                        oldy = character.y + i;
                        oldx = character.x - seeDistance - 1 + Math.abs(i);
                        
                        newCoords.push({
                            x: newx,
                            y: newy
                        });
                        
                        oldCoords.push({
                            x: oldx,
                            y: oldy
                        });
                    }
                    break;
                case structs.direction.DOWN:
                    for (var i = -seeDistance; i < seeDistance; i++) {
                        newy = character.y + seeDistance - Math.abs(i);
                        newx = character.x + i;
                        oldy = character.y - seeDistance - 1 + Math.abs(i);
                        oldx = character.x + i;
                        
                        newCoords.push({
                            x: newx,
                            y: newy
                        });
                        
                        oldCoords.push({
                            x: oldx,
                            y: oldy
                        });
                    }
                    break;
                case structs.direction.LEFT:
                    for (var i = -seeDistance; i < seeDistance; i++) {
                        newy = character.y + i;
                        newx = character.x - seeDistance + Math.abs(i);
                        oldy = character.y + i;
                        oldx = character.x + seeDistance + 1 - Math.abs(i);
                        
                        newCoords.push({
                            x: newx,
                            y: newy
                        });
                        
                        oldCoords.push({
                            x: oldx,
                            y: oldy
                        });
                    }
                    break;
            }
            
            utils.forEach(this.characters, function(char) {
                if (char !== character) {
                    for (var i = 0; i < oldCoords.length; i++) {
                        if (char.x === oldCoords[i].x && char.y === oldCoords.y) {
                            oldChars.push(char);
                        } else if (char.x === newCoords[i].x && char.y === newCoords[i].y) {
                            newChars.push(char);
                        }
                    }
                } 
            });
            
            utils.forEach(this.npcs, function(npc) {
                
            });
            
            utils.forEach(this.items, function(item) {
                
            });
            
            var builder = packet.builder(packet.family.AVATAR, packet.action.REMOVE);
            builder.addShort(character.playerID());
            
            utils.forEach(oldChars, function(char) {
                var rBuilder = packet.builder(packet.family.AVATAR, packet.action.REMOVE);
                rBuilder.addShort(char.playerID());
                
                char.send(builder);
                character.send(rBuilder); 
            });
            
            builder = packet.builder(packet.family.PLAYERS, packet.action.AGREE);
            builder.addByte(255);
            builder.addBreakString(character.name);
            builder.addShort(character.playerID());
            builder.addShort(character.mapid);
            builder.addShort(character.x);
            builder.addShort(character.y);
            builder.addChar(character.direction);
            builder.addChar(6); // ?
            builder.addString(character.paddedGuildTag());
            builder.addChar(character.level);
            builder.addChar(character.gender);
            builder.addChar(character.hairStyle);
            builder.addChar(character.hairColor);
            builder.addChar(character.race);
            builder.addShort(character.max_hp);
            builder.addShort(character.hp);
            builder.addShort(character.max_tp);
            builder.addShort(character.tp);
            character.addPaperdollData(builder, 'B000A0HSW');
            builder.addChar(character.sitting);
            builder.addChar(character.hidden);
            builder.addByte(255);
            builder.addChar(1); // 0 = NPC, 1 = player
            
            utils.forEach(newChars, function(char) {
                 var rBuilder = packet.builder(packet.family.PLAYERS, packet.action.AGREE);
                 rBuilder.addByte(255);
                 rBuilder.addBreakString(char.name);
                 rBuilder.addShort(char.playerID());
                 rBuilder.addShort(char.mapid);
                 rBuilder.addShort(char.x);
                 rBuilder.addShort(char.y);
                 rBuilder.addChar(char.direction);
                 rBuilder.addChar(6); // ?
                 rBuilder.addString(char.paddedGuildTag());
                 rBuilder.addChar(char.level);
                 rBuilder.addChar(char.gender);
                 rBuilder.addChar(char.hairStyle);
                 rBuilder.addChar(char.hairColor);
                 rBuilder.addChar(char.race);
                 rBuilder.addShort(char.max_hp);
                 rBuilder.addShort(char.hp);    
                 rBuilder.addShort(char.max_tp);
                 rBuilder.addShort(char.tp);
                 char.addPaperdollData(rBuilder, 'B000A0HSW');
                 rBuilder.addChar(char.sitting);
                 rBuilder.addChar(char.hidden);
                 rBuilder.addByte(255);
                 rBuilder.addChar(1); // 0 = NPC, 1 = player
                 
                 char.send(builder);
                 character.send(rBuilder);
            });
            
            builder = packet.builder(packet.family.WALK, packet.action.PLAYER);
            builder.addShort(character.playerID());
            builder.addChar(direction);
            builder.addChar(character.x);
            builder.addChar(character.y);
            
            utils.forEach(this.characters, function(char) {
                if (char !== character && character.charInRange(char)) {
                    char.send(builder);
                } 
            });
            
            builder = packet.builder(packet.family.WALK, packet.action.REPLY);
            builder.addByte(255);
            builder.addByte(255);
            
            utils.forEach(newItems, function(item) {
                
            });
            
            character.send(builder);
            
            builder = packet.builder(packet.family.APPEAR, packet.action.REPLY);
            utils.forEach(newNPCs, function(npc) {
                
            });
            
            utils.forEach(oldNPCs, function(npc) {
                // TODO: remove from view
            });
            
            // TODO: check quests rules
            
            // TODO: spike damage
            
            return structs.walkResult.ok;
        },
        getTile: function(x, y) {
            return this.tiles[y * this.width + x];
        },
        setTile: function(x, y, tile) {
            this.tiles[y * this.width + x] = tile;
        },
        load: function() {
            var fileName = '';

            function readBuf(buf, length) {
                var ret = buf.slice(buf.curPos, buf.curPos + length);
                buf.curPos += length;
                return ret;
            }

            for (var i = 0; i <  5 - this.id.toString().length; i++) {
                fileName += '0';
            }

            fileName += this.id + '.emf';

            var stats;	
            try {
                stats = fs.statSync('./data/maps/' + fileName);
                if (stats) {
                    var fData = packet.bufferToStr(fs.readFileSync('./data/maps/' + fileName)).split('');
                    fData.curPos = 0x03;
                    
                    this.rid = readBuf(fData, 4);
                    for(var i = 0; i < this.rid.length; i++) {
                        this.rid[i] = this.rid[i].charCodeAt();
                    }
                    
                    var buf;
                    var outersize;
                    var innersize;
                    
                    fData.curPos = 0x1F;
                    buf = readBuf(fData, 2);
                    this.pk = packet.packEOInt(buf[0].charCodeAt()) === 3;
                    this.effect = packet.packEOInt(buf[1].charCodeAt());
                    
                    fData.curPos = 0x25;
                    buf = readBuf(fData, 2);
                    this.width = packet.packEOInt(buf[0].charCodeAt()) + 1;
                    this.height = packet.packEOInt(buf[1].charCodeAt()) + 1;
                    
                    for(var i = 0; i < this.width * this.height; i++) {
                        this.tiles.push({
                            tilespec: -1,
                            warp: {},
                            walkable: function(npc) {
                                switch(this.tilespec) {
                                    case structs.tileSpec.wall:
                                    case structs.tileSpec.chairDown:
                                    case structs.tileSpec.chairLeft:
                                    case structs.tileSpec.chairRight:
                                    case structs.tileSpec.chairUp:
                                    case structs.tileSpec.chairDownRight:
                                    case structs.tileSpec.chairUpLeft:
                                    case structs.tileSpec.chairAll:
                                    case structs.tileSpec.chest:
                                    case structs.tileSpec.bankVault:
                                    case structs.tileSpec.mapEdge:
                                    case structs.tileSpec.board1:
                                    case structs.tileSpec.board2:
                                    case structs.tileSpec.board3:
                                    case structs.tileSpec.board4:
                                    case structs.tileSpec.board5:
                                    case structs.tileSpec.board6:
                                    case structs.tileSpec.board7:
                                    case structs.tileSpec.board8:
                                    case structs.tileSpec.jukebox:
                                        return false;
                                    case structs.tileSpec.npcBoundary:
                                        return !npc;
                                    default:
                                        return true;
                                }
                            }
                        });
                    }
                    
                    fData.curPos = 0x2A;
                    buf = readBuf(fData, 3);
                    this.scroll = packet.packEOInt(buf[0].charCodeAt());
                    this.relogX = packet.packEOInt(buf[1].charCodeAt());
                    this.relogY = packet.packEOInt(buf[2].charCodeAt());
                    
                    fData.curPos = 0x2E;
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    if (outersize) {
                        fData.curPos += 8 * outersize;
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    if (outersize) {
                        fData.curPos += 4 * outersize;
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    if (outersize) {
                        fData.curPos += 12 * outersize;
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    
                    if (this.id === 192) {
                        var foo = 'bar';
                    }
                    
                    for (var i = 0; i < outersize; i++) {
                        buf = readBuf(fData, 2);
                        var yloc = packet.packEOInt(buf[0].charCodeAt());
                        innersize = packet.packEOInt(buf[1].charCodeAt());
                        
                        for (var ii = 0; ii < innersize; ii++) {
                            buf = readBuf(fData, 2);
                            var xloc = packet.packEOInt(buf[0].charCodeAt());
                            var spec = packet.packEOInt(buf[1].charCodeAt())
                            
                            var tile = this.getTile(xloc, yloc);
                            tile.tilespec = spec;
                            this.setTile(xloc, yloc, tile);
                        }
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    for (var i = 0; i < outersize; i++) {
                        buf = readBuf(fData, 2);
                        var yloc = packet.packEOInt(buf[0].charCodeAt());
                        innersize = packet.packEOInt(buf[1].charCodeAt());
                        
                        for (var ii = 0; ii < innersize; ii++) {
                            var newWarp = {};
                            buf = readBuf(fData, 8);
                            var xloc = packet.packEOInt(buf[0].charCodeAt());
                            
                            newWarp.map = packet.packEOInt(buf[1].charCodeAt(), buf[2].charCodeAt());
                            newWarp.x = packet.packEOInt(buf[3].charCodeAt());
                            newWarp.y = packet.packEOInt(buf[4].charCodeAt());
                            newWarp.levelReq = packet.packEOInt(buf[5].charCodeAt());
                            newWarp.spec = packet.packEOInt(buf[6].charCodeAt(), buf[7].charCodeAt());
                            
                            var tile = this.getTile(xloc, yloc);
                            tile.warp = newWarp;
                            this.setTile(xloc, yloc, tile);
                        }
                    }
                    
                    fData.curPos = 0x2E;
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    var index = 0;
                    for (var i = 0; i < outersize; i++) {
                        buf = readBuf(fData, 8);
                        var x = packet.packEOInt(buf[0].charCodeAt());
                        var y = packet.packEOInt(buf[1].charCodeAt());
                        var npcID = packet.packEOInt(buf[2].charCodeAt(), buf[3].charCodeAt());
                        var spawnType = packet.packEOInt(buf[4].charCodeAt());
                        var spawnTime = packet.packEOInt(buf[5].charCodeAt(), buf[6].charCodeAt());
                        var amount = packet.packEOInt(buf[7].charCodeAt());
                        
                        for (var ii = 0; ii < amount; ii++) {
                            // TODO: NPCs
                        }
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    if (outersize) {
                        fData.curPos += 4 * outersize;
                    }
                    
                    buf = readBuf(fData, 1);
                    outersize = packet.packEOInt(buf[0].charCodeAt());
                    for (var i = 0; i < outersize; i++) {
                        buf = readBuf(fData, 12);
                        var x = packet.packEOInt(buf[0].charCodeAt());
                        var y = packet.packEOInt(buf[1].charCodeAt());
                        var slot = packet.packEOInt(buf[4].charCodeAt());
                        var itemID = packet.packEOInt(buf[5].charCodeAt(), buf[6].charCodeAt());
                        var time = packet.packEOInt(buf[7].charCodeAt(), buf[8].charCodeAt());
                        var amount = packet.packEOInt(buf[9].charCodeAt(), buf[10].charCodeAt(), buf[11].charCodeAt());
                        
                        // TODO: chests
                    }
                    
                    this.filesize = fData.length;
                }
            } catch (e) {
                console.log('error loading map ' + this.id);
            }
        }
    };
    
    map.load();
    
	return map;
}

module.exports = Map;