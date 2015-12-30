var fs = require('fs');
var config;

try {
    var data = fs.readFileSync('./config.json');
    config = JSON.parse(data.toString());
} catch (error) {
    console.log('error loading config.json');
}

module.exports = config;