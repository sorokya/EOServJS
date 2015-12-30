/*
 * talk.js - handles talk packet
 */

var config = require('../config.js');
var packet = require('../packet.js');
var commands = require('../commands.js');

function limitMessage(message, chatLength) {
    if (message.length > chatLength) {
        message = message.substr(0, chatLength - 6) + ' [...]';
    }
    
    return message;
}

function talk_handler(character, reader) {
    
    // NOTE: guild chat
    function talk_request() {
        
    }
    
    // NOTE: party chat
    function talk_open() {
        
    }
    
    // NOTE: global chat
    function talk_msg() {
        // TODO: block global from jail
        var message = limitMessage(reader.getEndString(), config.chatLength);
        character.world.msg(character, message, false);
    }
    
    // NOTE: private chat
    function talk_tell() {
        var name = reader.getBreakString();
        var message = limitMessage(reader.getEndString(), config.chatLength);
        
        var to = character.world.getCharacter(name);
        
        if (to && !to.hidden) {
            if (to.whispers) {
                to.msg(character, message);
            } else {
                character.msg(to, 'Sorry, ' + name + ' cannot hear any whispers at the moment.')
            }
        }
    }
    
    // NOTE: public chat
    function talk_report() {
        // TODO: handle muted
        
        var message = limitMessage(reader.getEndString(), config.chatLength);
        
        if (message === '') {
            return;
        }
        
        if (character.admin && message[0] === '$') {
            var args = message.split(' ');
            var command = args[0].substr(1); // trim the $
            args.splice(0, 1); // remove first item
            commands.execute(character, command, args);
        } else {
            character.map.msg(character, message, false);
        }
    }
    
    // NOTE: admin chat
    function talk_admin() {
        // var message = limitMessage(reader.getEndString(), config.chatLength);
        // character.world.adminMsg(character, message, false);
    }
    
    // NOTE: announcement
    function talk_announce() {
        var message = limitMessage(reader.getEndString(), config.chatLength);
        character.world.announceMsg(character, message, false);
    }
    
    switch (reader.action) {
        case packet.action.REQUEST:
            talk_request();
            break;
        case packet.action.OPEN:
            talk_open();
            break;
        case packet.action.MSG:
            talk_msg();
            break;
        case packet.action.TELL:
            talk_tell();
            break;
        case packet.action.REPORT:
            talk_report();
            break;
        case packet.action.ADMIN:
            talk_admin();
            break;
        case packet.action.ANNOUNCE:
            talk_announce();
            break;
    }
}

module.exports = talk_handler;