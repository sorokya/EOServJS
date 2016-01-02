module.exports = {
	random: function (min, max) {
		max++;
		return Math.floor(Math.random() * (max - min) + min);
	},
	forEach: function (ary, fn_callback) {
		for (var i = 0; i < ary.length; i++) {
			fn_callback(ary[i], i);
		}
	},
	pathLength: function (x1, y1, x2, y2) {
		var dx = Math.abs(x1 - x2);
		var dy = Math.abs(y1 - y2);
		
		return dx + dy;
	}
};
