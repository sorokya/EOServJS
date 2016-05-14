/*
 * npc.js - handles an instanced of an npc in the world
 */

'use strict';

let structs = require('./structs');
let utils = require('./utils');
let packet = require('./packet');

function npc(map, id, x, y, spawnType, spawnTime, index, temporary) {
	let speedTable = [0.9, 0.6, 1.3, 1.9, 3.7, 7.5, 15.0, 0.0];
	let NPC = {
		map: map,
		id: id,
		spawnX: x,
		spawnY: y,
		x: x,
		y: y,
		spawnType: spawnType,
		spawnTime: spawnType === 7 ? 0 : spawnTime,
		index: index,
		temporary: temporary,
		alive: false,
		hp: 0,
		attack: false,
		totalDamage: 0,
		walkIdleFor: 0,
		direction: spawnType === 7 ? spawnTime & 0x03 : structs.direction.DOWN,
		parent: 0,
		citizenship: 0,
		data: function () {
			return this.map.world.enf.get(this.id);
		},
		spawn: function () {
			if (this.alive) {
				return;
			}

			if (this.spawnType < 7) {
				let found = false;

				for (let i = 0; i < 100; i++) {
					if (this.temporary && i === 0) {
						this.x = this.spawnX;
						this.y = this.spawnY;
					} else {
						this.x = utils.random(this.spawnX - 2, this.spawnX + 2);
						this.y = utils.random(this.spawnY - 2, this.spawnY + 2);
					}

					if (this.map.walkable(this.x, this.y, true) && (i < 100 || !this.map.occupied(this.x, this.y, structs.targetRestrict.NPCOnly))) {
						this.direction = utils.random(0, 3);
						found = true;
						break;
					}
				}

				if (!found) {
					
				}

				this.alive = true;
				this.hp = this.data().hp;
				this.lastAction = new Date;
				this.actionSpeed = speedTable[this.spawnType];

				let builder = packet.builder(packet.family.APPEAR, packet.action.REPLY);
				builder.addChar(0);
				builder.addByte(255);
				builder.addChar(this.index);
				builder.addShort(this.id);
				builder.addChar(this.x);
				builder.addChar(this.y);
				builder.addChar(this.direction);

				utils.forEach(this.map.characters, function (char) {
					if (char.inRange(this.x, this.y)) {
						char.send(builder);
					}
				});
			}
		},
		removeFromView: function (character) {
			let builder = packet.builder(packet.family.NPC, packet.action.PLAYER);
			builder.addChar(this.index);
			if (character.x > 200 && character.y > 200) {
				builder.addChar(0); // ?
				builder.addChar(0); // ?
			} else {
				builder.addChar(252); // ?
				builder.addChar(252); // ?
			}

			builder.addChar(0); // direction
			builder.addByte(255);
			builder.addByte(255);
			builder.addByte(255);

			let builder2 = packet.builder(packet.family.NPC, packet.action.SPEC);
			builder2.addShort(0); // killer pid
			builder2.addChar(0); // killer direction
			builder2.addShort(this.index);

			character.send(builder);
			character.send(builder2);
		},
		loadShop: function () {
		},
		loadDrop: function () {
		}
	}
	
	NPC.loadDrop();
	NPC.loadShop();

	return NPC;
}

module.exports = npc;