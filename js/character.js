var config = require('./config.js');
var utils = require('./utils.js');
var structs = require('./structs.js');
var packet = require('./packet.js');

function Character(data, world, user) {
    function characterItem(id, amount) {
        return {
            id: id || 0,
            amount: amount || 0
        }
    }
    
    function characterSpell(id, level) {
        return {
            id: id || 0,
            level: level || 0
        }
    }
    
    function itemSerialize(list) {
        var serialized = '';
        
        utils.forEach(list, function(item, i) {
            serialized += item.id + ',' + item.amount;
            
            if (i !== list.length - 1) {
                serialized += ';';
            }
        });
        
        return serialized;
    }
    
    function itemUnserialize(serialized) {
        var list = [];
        
        if (serialized) {
            var items = serialized.split(';');
        
            if (items && items.length) {
                utils.forEach(items, function(item) {
                    var id = Number(item.split(',')[0]); 
                    var amount = Number(item.split(',')[1]); 
                    
                    if (!(id < 1 || id > 65535 || amount < 1)) {
                        list.push(characterItem(id, amount));
                    }
                });
            }
        }
        
        return list;
    }
    
    function dollSerialize(list) {
        return list.join(',');
    }
    
    function dollUnserialize(serialized) {
        var list = [];
        
        if (serialized) {
            var items = serialized.split(',');
            
            if(items && items.length) {
                utils.forEach(items, function(item) {
                    var id = Number(item);
                    if (!(id < 0 || id > 65535)) {
                        list.push(id);
                    }
                });
            }
        }
        
        if (list.length === 0) {
            for (var i = 0; i < 15; i++) {
                list.push(0);
            }
        }
        
        return list;
    }
    
    function spellSerialize(list) {
        var serialized = '';
        
        utils.forEach(list, function(spell, i) {
           serialized += spell.id + ',' + spell.level;
           
           if (i !== list.length - 1) {
               serialized += ';';
           }
        });
        
        return serialized;
    }
    
    function spellUnserialize(serialized) {
        var list = [];
        
        if (serialized) {
            var spells = serialized.split(';');
            if (spells && spells.length) {
                utils.forEach(spells, function(spell) {
                    var id = Number(spell.split(',')[0]);
                    var level = Number(spell.split(',')[0]);

                    if (!(id < 1 || id > 65535 || level < 0)) {
                        list.push(characterSpell(id, level)) 
                    }
                });
            }
        }
        
        return list;
    }
    
    var character = {
        world: world,
        loginTime: new Date,
        
        online: false,
        nowhere: false,
        
        id: world.generateCharacterID(),
        
        name: data.name,
        title: data.title,
        home: data.home,
        fiance: data.fiance,
        partner: data.partner,
        admin: data.admin,
        
        class: data.class,
        gender: data.gender,
        race: data.race,
        hairStyle: data.hairStyle,
        hairColor: data.hairColor,
        
        x: data.x,
        y: data.y,
        direction: data.direction,
        
        level: data.level,
        exp: data.exp,
        
        hp: data.hp,
        tp: data.tp,
        
        str: data.str,
        int: data.int,
        wis: data.wis,
        agi: data.agi,
        con: data.con,
        cha: data.cha,
        statpoints: data.statpoints,
        skillpoints: data.skillpoints,
        karma: data.karma,
        
        adjust_str: null,
        adjust_int: null,
        adjust_wis: null,
        adjust_agi: null,
        adjust_con: null,
        adjust_cha: null,
        
        weight: 0,
        max_weight: 0,
        
        max_hp: 0,
        max_tp: 0,
        max_sp: 0,
        
        min_dam: 0,
        max_dam: 0,
        
        accuracy: 0,
        evade: 0,
        armor: 0,
        
        trading: false,
        trade_partner: 0,
        trade_agree: false,
        trade_inventory: [],
        
        party_trust_send: 0,
        party_trust_recv: 0,
        party_send_type: null,
        
        npc: 0,
        npc_type: structs.ENFType.NPC,
        board: 0,
        jukebox_open: false,
        
        spell_ready: false,
        spell_id: 0,
        spell_event: 0,
        spell_target: structs.spellTarget.invalid,
        spell_target_id: 0,
        
        next_area: 0,
        arena: 0,
        
        warp_anim: structs.warpAnimation.invalid,

        sitting: data.sitting,
        hidden: data.hidden,
        whispers: true,
        
        bankmax: data.bankmax,
        
        goldbank: data.goldbank,
        
        usage: data.usage,
        
        inventory: itemUnserialize(data.inventory),
        bank: itemUnserialize(data.bank),
        paperdoll: dollUnserialize(data.paperdoll),
        spells: spellUnserialize(data.spells),
        
        player: null,
        guild_tag: data.guild.trim(),
        guild: data.guild,
        guild_rank: data.guild_rank,
        guild_rank_string: data.guild_rank_string,
        
        party: 0,
        map: world.getMap(data.map),
        mapid: data.map,
        
        last_walk: 0.0,
        attacks: 0,
        
        quest_string: data.quest,
        
        nointeract: data.nointeract,

        muted_until: 0,
        guild_join: '',
        guild_invite: '',
        timestamp: 0,
        chat_log: [],
        unregister_npc: [],
        quests: [],
        quests_inactive: [],
        
        cancelSpell: function() {
            
        },
        
        canHoldItem: function(id, max_amount) {
            var amount = max_amount;
            
            if (config.enforceWeight && this.admin === 0) {
                var item = this.world.eif.get(id);
                
                if (this.weight > this.max_weight) {
                    amount = 0;
                } else if (!item.id || item.weight === 0) {
                    amount = max_amount;
                } else {
                    amount = Math.min((this.max_weight - this.weight) / item.weight, max_amount);
                }
            }
            
            return Math.min(amount, config.MaxItem);
        },
        
        hasItem: function(id, include_trade) {
            var $this = this;
            
            for(var i = 0; i < $this.inventory.length; i++) {
                var item = $this.inventory[i];
                
                if (item.id === id) {
                    if ($this.trading && include_trade) {
                        for (var ii = 0; ii < $this.trade_inventory.length; ii++) {
                            var trade_item = $this.trade_inventory[ii];
                            if (trade_item === id) {
                                return Math.max(item.amount - trade_item.amount, 0);
                            }
                        }
                        
                        return item.amount;
                    } else {
                        return item.amount;
                    }
                }
            }
            
            return 0;
        },
        
        delItem: function(id, amount) {
            var $this = this;
            
            if (amount <= 0) {
                return false;
            }
            
            for (var i = 0; i < $this.inventory.length; i++) {
                var item = $this.inventory[i];
                if (item.id === id) {
                    if (item.amount < 0 || item.amount - amount <= 0) {
                        $this.inventory.splice(i, 1);
                    } else {
                        $this.inventory[i].amount -= amount;
                    }
                    
                    $this.calculateStats();
                    return true;
                }
            }
        },
        
        addItem: function(id, amount) {
            var $this = this;
            if (amount <= 0) {
                return false;
            }
            
            if (id <= 0 || id >= $this.world.eif.data.length) {
                return false;
            }
            
            for (var i = 0; i < $this.inventory.length; i++) {
                var item = $this.inventory[i];
                if (item.id === id) {
                    if (item.amount + amount < 0) {
                        return;
                    }
                    
                    $this.inventory[i].amount += amount;
                    $this.calculateStats();
                    return true;
                }
            }
            
            var newItem = {};
            newItem.id = id;
            newItem.amount = amount;
            
            this.inventory.push(newItem);
            this.calculateStats();
            return true;
        },
        
        warp: function(map, x, y, animation) {
            if (map <= 0 || map > this.world.maps.length) {
                return;
            }
            
            var builder = packet.builder(packet.family.WARP, packet.action.REQUEST);
            if (this.mapid === map && !this.nowhere) {
                builder.addChar(structs.warpType.local);
                builder.addShort(map);
                builder.addChar(x);
                builder.addChar(y);
            } else {
                builder.addChar(structs.warpType.switch);
                builder.addShort(map);
                builder.addByte(this.world.getMap(map).rid[0]);
                builder.addByte(this.world.getMap(map).rid[1]);
                builder.addByte(this.world.getMap(map).rid[2]);
                builder.addByte(this.world.getMap(map).rid[3]);
                builder.addThree(this.world.getMap(map).filesize);
                builder.addChar(0); // ?
                builder.addChar(0); // ?
            }
            
            if (this.map && this.map.exists) {
                this.map.leave(this, animation);
            }
            
            this.map = this.world.getMap(map);
            this.mapid = map;
            this.x = x;
            this.y = y;
            this.sitting = structs.sitState.stand;
            
            this.npc = 0;
            this.npc_type = structs.ENFType.NPC;
            this.board = 0;
            this.jukebox_open = false;
            this.guild_join = '';
            this.guild_invite = '';
            
            if (this.trading) {
                // TODO: cancel trade
            }
            
            this.warp_anim = animation;
            this.nowhere = false;
            
            this.map.enter(this, animation);
            this.send(builder);
        },
        
        refresh: function() {
            var $this = this;
            var updateCharacters = [];
            var updateNPCs = [];
            var updateItems = [];
            
            utils.forEach($this.map.characters, function(char) {
               if ($this.charInRange(char)) {
                   updateCharacters.push(char);
               } 
            });
            
            utils.forEach($this.map.npcs, function(npc) {
                
            });
            
            utils.forEach($this.map.items, function(item) {
                
            });
            
            var builder = packet.builder(packet.family.REFRESH, packet.action.REPLY);
            builder.addChar(updateCharacters.length);
            builder.addByte(255);
            
            utils.forEach(updateCharacters, function(char) {
               builder.addBreakString(char.name);
               builder.addShort(char.playerID());
               builder.addShort(char.mapid);
               builder.addShort(char.x); 
               builder.addShort(char.y);
               builder.addChar(char.direction);
               builder.addChar(6);
               builder.addString(char.paddedGuildTag());
               builder.addChar(char.level);
               builder.addChar(char.gender);
               builder.addChar(char.hairStyle);
               builder.addChar(char.hairColor);
               builder.addChar(char.race);
               builder.addShort(char.max_hp);
               builder.addShort(char.hp);
               builder.addShort(char.max_tp);
               builder.addShort(char.tp);
               
               char.addPaperdollData(builder, 'B000A0HSW');
               
               builder.addChar(char.sitting);
               builder.addChar(char.hidden);
               builder.addByte(255);
            });
            
            utils.forEach(updateNPCs, function(npc) {
                
            });
            
            builder.addByte(255);
            
            utils.forEach(updateItems, function(item) {
                
            });
            
            $this.send(builder);
        },
        
        msg: function(from, message) {
            var builder = packet.builder(packet.family.TALK, packet.action.TELL);
            builder.addBreakString(from.name);
            builder.addBreakString(message);
            this.send(builder);
        },
        
        attack: function(direction) {
            this.map.attack(this, direction);
        },
        
        sit: function(state) {
            this.map.sit(this, state);
        },
        
        stand: function() {
            this.map.stand(this);
        },
        
        emote: function(emote, echo) {
            this.map.emote(this, emote, echo)  
        },
        
        walk: function(direction) {
            return this.map.walk(this, direction);
        },
        
        walkAdmin: function(direction) {
            return this.map.walk(this, direction, true);
        },
        
        logout: function() {
            // TODO: cancel spells, trades, parties. leave arena. unregister npcs
            
            this.online = false;
            this.save();
            this.world.logoutChar(this);
        },
        
        login: function() {
            
        },
        
        inRange: function(x, y) {
            return utils.pathLength(this.x, this.y, x, y) <= 11;
        },
        
        charInRange: function(_char) {
            if (this.nowhere || _char.nowhere) {
                return false;
            }
            
            return this.inRange(_char.x, _char.y);  
        },
        
        send: function(builder) {
            this.player.send(builder);
        },
        
        addPaperdollData: function(builder, format) {
            var wep = this.world.eif.get(this.paperdoll[structs.equipmentLocation.weapon]);
            var boots = this.world.eif.get(this.paperdoll[structs.equipmentLocation.boots]).dollGraphic;
            var armor = this.world.eif.get(this.paperdoll[structs.equipmentLocation.armor]).dollGraphic;
            var hat = this.world.eif.get(this.paperdoll[structs.equipmentLocation.hat]).dollGraphic;
            var weapon = this.world.eif.get(this.paperdoll[structs.equipmentLocation.weapon]).dollGraphic;
            var shield = this.world.eif.get(this.paperdoll[structs.equipmentLocation.shield]).dollGraphic;
            
            if (wep.subType === structs.EIFSubType.twoHanded && wep.dualWieldDollGraphic) {
                shield = wep.dualWieldDollGraphic;
            }
            
            if (boots === 65535) boots = 0;
            if (armor === 65535) armor = 0;
            if (hat === 65535) hat = 0;
            if (weapon === 65535) weapon = 0;
            if (shield === 65535) shield = 0;
            
            for (var i = 0; i < format.length; i++) {
                switch (format[i]) {
                    case 'B':
                        builder.addShort(boots);
                        break;
                    case 'A':
                        builder.addShort(armor);
                        break;
                    case 'H':
                        builder.addShort(hat);
                        break;
                    case 'W':
                        builder.addShort(weapon);
                        break;
                    case 'S':
                        builder.addShort(shield);
                        break;
                    case '0':
                        builder.addShort(0);
                        break;
                }
            }
        },
        
        paddedGuildTag: function() {
            return '   ';  
        },
        
        playerID: function() {
            return this.player.id;  
        },
        
        formulaVars: function(prefix) {
            var formulas = {};
            
            formulas.hp = 30 + (this.level * 2.5) + (this.adjust_con * 2.5);
            formulas.tp = 10 + (this.level * 2.5) + (this.adjust_int * 2.5) + (this.adjust_wis * 1.5);
            formulas.sp = 20 + (this.level * 2);
            formulas.weight = 70 + this.str;
            
            return formulas;       
        },
        
        calculateStats: function() {
            var $this = this;
            var ecf = world.ecf.get($this.class);
            
            $this.adjust_str = $this.str + ecf.str;
            $this.adjust_int = $this.int + ecf.int;
            $this.adjust_wis = $this.wis + ecf.wis;
            $this.adjust_agi = $this.agi + ecf.agi;
            $this.adjust_con = $this.con + ecf.con;
            $this.adjust_cha = $this.cha + ecf.cha;
            
            $this.max_weight = 70;
            $this.weight = 0;
            $this.max_hp = 0;
            $this.max_tp = 0;
            $this.min_dmg = 0;
            $this.max_dmg = 0;
            $this.accuracy = 0;
            $this.evade = 0;
            $this.armor = 0;
            $this.max_sp = 0;   
            
            utils.forEach($this.inventory, function(item) {
                $this.weight += $this.world.eif.get(item.id).weight * item.amount;
            });
            
            utils.forEach($this.paperdoll, function(i) {
                var item = $this.world.eif.get(i);
                $this.weight += item.weight;
                $this.max_hp += item.hp;
                $this.max_tp += item.tp;
                $this.min_dmg += item.minDam;
                $this.max_dmg += item.maxDam;
                $this.accuracy += item.accuracy;
                $this.evade += item.evade;
                $this.armor += item.armor;
                $this.adjust_str += item.str;
                $this.adjust_int += item.int;
                $this.adjust_wis += item.wis;
                $this.adjust_agi += item.agi;
                $this.adjust_con += item.con;
                $this.adjust_cha += item.cha;
            });
            
            if ($this.weight < 0 || $this.weight > 250) {
                $this.weight = 250;
            }
            
            var formulaVars = $this.formulaVars();
            $this.max_hp += formulaVars.hp;
            $this.max_tp += formulaVars.tp;
            $this.max_sp += formulaVars.sp;
            $this.max_weight += formulaVars.weight;
            
            $this.min_dmg += $this.adjust_str / 2;
            $this.max_dmg += $this.adjust_str / 2;
            $this.accuracy += $this.adjust_agi / 2;
            $this.evade += $this.adjust_agi / 2;
            $this.armor += $this.adjust_con / 2;
            
            if ($this.min_dmg === 0) {
                $this.min_dmg += 1;
            }
            
            if ($this.max_dmg === 0) {
                $this.max_dmg += 1;
            }
        },
        
        save: function() {
            var $this = this;
            var charIndex = user.characters.indexOf(user.characters.filter(function(c) {
                return c.name === $this.name;
            })[0]);
            
            user.characters[charIndex] = {
                name: $this.name,
                title: $this.title,
                home: $this.home,
                fiance: $this.fiance,
                partner: $this.partner,
                admin: $this.admin,
                class: $this.class,
                gender: $this.gender,
                race: $this.race,
                hairStyle: $this.hairStyle,
                hairColor: $this.hairColor,
                map: $this.mapid,
                x: $this.x,
                y: $this.y,
                direction: $this.direction,
                level: $this.level,
                exp: $this.exp,
                hp: $this.hp,
                tp: $this.tp,
                str: $this.str,
                int: $this.int,
                wis: $this.wis,
                agi: $this.agi,
                con: $this.con,
                cha: $this.cha,
                statpoints: $this.statpoints,
                skillpoints: $this.skillpoints,
                karma: $this.karma,
                sitting: $this.sitting,
                hidden: $this.hidden,
                nointeract: $this.nointeract,
                bankmax: $this.bankmax,
                goldbank: $this.goldbank,
                usage: $this.usage,
                inventory: itemSerialize($this.inventory),
                bank: itemSerialize($this.bank),
                paperdoll: dollSerialize($this.paperdoll),
                spells: spellSerialize($this.spells),
                guild: '',
                guild_rank: 0,
                guild_rank_string: '',
                quest: '',
                vars: ''
            }
            
            user.save();
        }
    };
    
    character.display_str = character.adjust_str;
    character.display_int = character.adjust_int;
    character.display_wis = character.adjust_wis;
    character.display_agi = character.adjust_agi;
    character.display_con = character.adjust_con;
    character.display_cha = character.adjust_cha;
    
    return character;
}

module.exports = Character;