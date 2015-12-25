/*
 * $this.js - loads/handles eo map files
 */

var fs = require('fs');
var packet = require('./packet.js');
var utils = require('./utils.js');

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
        tile: [],
        rid: [],
        pk: false,
        effect: 0,
        width: 0,
        height: 0,
        scroll: 0,
        relogX: 0,
        relogY: 0,
        filesize: 0,
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
        leave: function() {
            
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
        load: function() {
            var fileName = '';
            var $this = this;
            $this.tiles = [];

            function getTile(x, y) {
                return $this.tiles[y * $this.width + x];
            }

            function setTile(x, y, tile) {
                $this.tiles[y * $this.width + x] = tile;
            }

            function readBuf(buf, length) {
                var ret = buf.slice(buf.curPos, buf.curPos + length);
                buf.curPos += length;
                return ret;
            }

            for (var i = 0; i <  5 - $this.id.toString().length; i++) {
                fileName += '0';
            }

            fileName += $this.id + '.emf';

            var stats;	
            try {
                stats = fs.statSync('./data/maps/' + fileName);
                if (stats) {
                    var fData = packet.bufferToStr(fs.readFileSync('./data/maps/' + fileName)).split('');
                    fData.curPos = 0x03;
                    
                    $this.rid = readBuf(fData, 4);
                    for(var i = 0; i < $this.rid.length; i++) {
                        $this.rid[i] = $this.rid[i].charCodeAt();
                    }
                    
                    var buf;
                    var outersize;
                    var innersize;
                    
                    fData.curPos = 0x1F;
                    buf = readBuf(fData, 2);
                    $this.pk = packet.packEOInt(buf[0].charCodeAt()) === 3;
                    $this.effect = packet.packEOInt(buf[1].charCodeAt());
                    
                    fData.curPos = 0x25;
                    buf = readBuf(fData, 2);
                    $this.width = packet.packEOInt(buf[0].charCodeAt()) + 1;
                    $this.height = packet.packEOInt(buf[1].charCodeAt()) + 1;
                    
                    for(var i = 0; i < $this.width * $this.height; i++) {
                        $this.tiles.push({
                            tilespec: -1
                        });
                    }
                    
                    fData.curPos = 0x2A;
                    buf = readBuf(fData, 3);
                    $this.scroll = packet.packEOInt(buf[0].charCodeAt());
                    $this.relogX = packet.packEOInt(buf[1].charCodeAt());
                    $this.relogY = packet.packEOInt(buf[2].charCodeAt());
                    
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
                    
                    for (var i = 0; i < outersize; i++) {
                        buf = readBuf(fData, 2);
                        var yloc = packet.packEOInt(buf[0].charCodeAt());
                        innersize = packet.packEOInt(buf[1].charCodeAt());
                        
                        for (var ii = 0; ii < innersize; ii++) {
                            buf = readBuf(fData, 2);
                            var xloc = packet.packEOInt(buf[0].charCodeAt());
                            var spec = packet.packEOInt(buf[1].charCodeAt());
                            setTile(xloc, yloc, { tilespec: spec });
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
                            
                            var tile = getTile(xloc, yloc);
                            tile.warp = newWarp;
                            setTile(xloc, yloc, tile);
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
                    
                    $this.filesize = fData.length;
                }
            } catch (e) {
                console.log('error loading map ' + $this.id);
            }
        }
    };
	
	
	
	return map;
}

module.exports = Map;