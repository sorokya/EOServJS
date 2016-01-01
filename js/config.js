var fs = require('fs');
var config

function getTimeMS(timeStr) {
    if (typeof timeStr === 'string') {
        var flag = timeStr[timeStr.length - 1];
        var time = Number(timeStr.substr(0, timeStr.length - 1));
        
        if (!isNaN(time) && ['s', 'm', 'h'].indexOf(flag) > -1) {
            switch (flag) {
                case 's':
                    time = time * 1000;
                    break;
                case 'm':
                    time = time * 60 * 1000;
                    break;
                case 'h':
                    time = time * 60 * 60 * 1000;
                    break;
            }
            
            return time;
        } else {
            return timeStr;
        }
    } else {
        return timeStr;
    }
}

function getPercent(percentStr) {
    if (typeof percentStr === 'string') {
        if (percentStr[percentStr.length - 1] === '%') {
            var percent = Number(percentStr.substr(0, percentStr.length - 1));
            
            if (!isNaN(percent)) {
                return percent / 100;
            } else {
                return percentStr;
            }
        } else {
            return percentStr;
        }
    } else {
        return percentStr;
    }
}

try {
    var data = fs.readFileSync('./config.json');
    config = JSON.parse(data.toString());
    
    for(var key in config) {
        config[key] = getTimeMS(config[key]);
        config[key] = getPercent(config[key]);
    }
} catch (error) {
    console.log('error loading config.json');
}

module.exports = config;