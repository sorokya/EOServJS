/*
 * $this.js - loads/handles eo map files
 */

var fs = require('fs');
var packet = require('./packet.js');

function map(id) {
	var fileName = '';
	var $this = {};
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
	
	for (var i = 0; i <  5 - id.toString().length; i++) {
		fileName += '0';
	}
	
	fileName += id + '.emf';

	var stats;	
	try {
		stats = fs.statSync('./data/maps/' + fileName);
		if (stats) {
			var fData = packet.bufferToStr(fs.readFileSync('./data/maps/' + fileName)).split('');
			fData.curPos = 0x03;
			
			var rid = readBuf(fData, 4);
			
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
		}
	} catch (e) {
		console.log('error loading map ' + id);
	}
	
	return $this;
}

module.exports = map;