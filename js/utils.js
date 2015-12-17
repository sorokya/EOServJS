module.exports = {
  random: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
  forEach: function(ary, fn_callback) {
    for(var i = 0; i < ary.length; i++) {
      fn_callback(ary[i], i);
    }
  }
};
