var data = require('./js/data.js');
var server = require('./js/server.js');

console.log('____ ____ ____ ____ ____ _  _   _ ____');
console.log('|___ |  | [__  |___ |__/ |  |   | [__ ');
console.log('|___ |__| ___] |___ |  \\  \\/  ._| ___]')
console.log('Accounts: ' + data.users.length);
console.log('Characters: ' + data.getCharacterCount());
console.log('Guilds: ' + data.guilds.length);
server.start();
