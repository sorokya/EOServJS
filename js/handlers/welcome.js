/*
 * welcome.js
 * handles welcome packet
 */

var packet = require('../packet.js');
var utils = require('../utils.js');
var data = require('../data.js');
var structs = require('../structs.js');

function welcome_handler(player, reader) {
	
	// selected a character
	function welcome_request() {
		var id = reader.getInt(); // character id
		var char = player.characters.filter(function (c) {
			return c.id === id;
		})[0];
		
		if (!char) {
			return;
		}
		
		player.character = char;
		player.character.calculateStats();
		var guild_str = '';
		var guild_rank = '';
		
		var reply = packet.builder(packet.family.WELCOME, packet.action.REPLY);
		reply.addShort(1); // REPLY_WELCOME sub-id
		reply.addShort(player.id);
		reply.addInt(player.character.id);
		
		reply.addShort(player.character.mapid);
		reply.addByte(player.world.getMap(player.character.mapid).rid[0]);
		reply.addByte(player.world.getMap(player.character.mapid).rid[1]);
		reply.addByte(player.world.getMap(player.character.mapid).rid[2]);
		reply.addByte(player.world.getMap(player.character.mapid).rid[3]);
		reply.addThree(player.world.getMap(player.character.mapid).filesize);
		reply.addByte(player.world.eif.rid[0]);
		reply.addByte(player.world.eif.rid[1]);
		reply.addByte(player.world.eif.rid[2]);
		reply.addByte(player.world.eif.rid[3]);
		reply.addByte(player.world.eif.len[0]);
		reply.addByte(player.world.eif.len[1]);
		reply.addByte(player.world.enf.rid[0]);
		reply.addByte(player.world.enf.rid[1]);
		reply.addByte(player.world.enf.rid[2]);
		reply.addByte(player.world.enf.rid[3]);
		reply.addByte(player.world.enf.len[0]);
		reply.addByte(player.world.enf.len[1]);
		reply.addByte(player.world.esf.rid[0]);
		reply.addByte(player.world.esf.rid[1]);
		reply.addByte(player.world.esf.rid[2]);
		reply.addByte(player.world.esf.rid[3]);
		reply.addByte(player.world.esf.len[0]);
		reply.addByte(player.world.esf.len[1]);
		reply.addByte(player.world.ecf.rid[0]);
		reply.addByte(player.world.ecf.rid[1]);
		reply.addByte(player.world.ecf.rid[2]);
		reply.addByte(player.world.ecf.rid[3]);
		reply.addByte(player.world.ecf.len[0]);
		reply.addByte(player.world.ecf.len[1]);
		reply.addBreakString(player.character.name);
		reply.addBreakString(player.character.title);
		reply.addBreakString(guild_str);
		reply.addBreakString(guild_rank);
		reply.addChar(player.character.class);
		reply.addString(player.character.paddedGuildTag());
		reply.addChar(player.character.admin);
		reply.addChar(player.character.level);
		reply.addInt(player.character.exp);
		reply.addInt(player.character.usage);
		reply.addShort(player.character.hp);
		reply.addShort(player.character.max_hp);
		reply.addShort(player.character.tp);
		reply.addShort(player.character.max_tp);
		reply.addShort(player.character.max_sp);
		reply.addShort(player.character.statpoints);
		reply.addShort(player.character.skillpoints);
		reply.addShort(player.character.karma);
		reply.addShort(player.character.min_dmg);
		reply.addShort(player.character.max_dmg);
		reply.addShort(player.character.accuracy);
		reply.addShort(player.character.evade);
		reply.addShort(player.character.armor);
		reply.addShort(player.character.adjust_str);
		reply.addShort(player.character.adjust_int);
		reply.addShort(player.character.adjust_wis);
		reply.addShort(player.character.adjust_agi);
		reply.addShort(player.character.adjust_con);
		reply.addShort(player.character.adjust_cha);
		
		utils.forEach(player.character.paperdoll, function (item) {
			reply.addShort(item);
		});
		
		reply.addChar(player.character.guild_rank);
		reply.addShort(76); // Jail Map ID
		reply.addShort(4); // ?
		reply.addChar(24); // ?
		reply.addChar(24); // ?
		reply.addShort(0); // Light guide admin command flood rate
		reply.addShort(0); // Guardian admin command flood rate
		reply.addShort(0); // GM/HGM admin command flood rate
		reply.addShort(2); // ?
		reply.addChar(player.character.usage === 0 ? 2 : 0); // login warning message
		reply.addByte(255);
		player.send(reply);
	}
	
	// welcome message
	function welcome_msg() {
		reader.getThree(); // ?
		player.world.loginChar(player.character);
		player.client.state = player.client.clientState.Playing;
		
		var updateCharacters = [];
		
		utils.forEach(player.character.map.characters, function (char) {
			if (player.character.charInRange(char)) {
				updateCharacters.push(char);
			}
		});
		
		var updateItems = [];
		
		utils.forEach(player.character.map.items, function (item) {
			if (player.character.inRange(item.x, item.y)) {
				updateItems.push(item);
			}
		});
		
		var reply = packet.builder(packet.family.WELCOME, packet.action.REPLY);
		reply.addShort(2); // REPLY_WELCOME sub-id
		reply.addByte(255);
		
		for (var i = 0; i < 9; i++) {
			reply.addBreakString('Server News');
		}
		
		reply.addChar(player.character.weight); // weight
		reply.addChar(player.character.max_weight); // max weight
		
		utils.forEach(player.character.inventory, function (item) {
			reply.addShort(item.id);
			reply.addInt(item.amount);
		});
		reply.addByte(255);
		
		utils.forEach(player.character.spells, function (spell) {
			reply.addShort(spell.id);
			reply.addShort(spell.level);
		});
		reply.addByte(255);
		
		reply.addChar(updateCharacters.length); // num of players
		reply.addByte(255);
		
		utils.forEach(updateCharacters, function (char) {
			reply.addBreakString(char.name);
			reply.addShort(char.playerID());
			reply.addShort(char.map);
			reply.addShort(char.x);
			reply.addShort(char.y);
			reply.addChar(char.direction);
			reply.addChar(6); // ?
			reply.addString(char.paddedGuildTag());
			reply.addChar(char.level);
			reply.addChar(char.gender);
			reply.addChar(char.hairStyle);
			reply.addChar(char.hairColor);
			reply.addChar(char.race);
			reply.addShort(char.max_hp);
			reply.addShort(char.hp);
			reply.addShort(char.map_tp);
			reply.addShort(char.tp);
			char.addPaperdollData(reply, 'B000A0HSW');
			reply.addChar(char.sitting);
			reply.addChar(char.hidden);
			reply.addByte(255);
		});
		
		reply.addByte(255);
		
		utils.forEach(updateItems, function (item) {
			reply.addShort(item.uid);
			reply.addShort(item.id);
			reply.addChar(item.x);
			reply.addChar(item.y);
			reply.addThree(item.amount);
		});
		
		player.send(reply);
	}
	
	// client wants a file
	function welcome_agree() {
		var file = reader.getChar();
		
		switch (file) {
			case structs.fileType.map:
				player.client.upload(structs.fileType.map, player.character.mapid, structs.initReply.fileMap)
				break;
			case structs.fileType.item:
				player.client.upload(structs.fileType.item, 1, structs.initReply.fileEIF)
				break;
			case structs.fileType.npc:
				player.client.upload(structs.fileType.npc, 1, structs.initReply.fileENF)
				break;
			case structs.fileType.spell:
				player.client.upload(structs.fileType.spell, 1, structs.initReply.fileESF)
				break;
			case structs.fileType.class:
				player.client.upload(structs.fileType.class, 1, structs.initReply.fileECF)
				break;
			default:
				return;
		}
	}
	
	switch (reader.action) {
		case packet.action.REQUEST:
			welcome_request();
			break;
		case packet.action.MSG:
			welcome_msg();
			break;
		case packet.action.AGREE:
			welcome_agree();
			break;
	}
}

module.exports = welcome_handler;

/*
if (player->character)
		throw std::runtime_error("Character already selected");

	unsigned int id = reader.GetInt(); // Character ID

	auto it = std::find_if(UTIL_CRANGE(player->characters), [&](Character *c) -> bool
	{
		return c->id == id;
	});

	if (it == player->characters.end())
		return;

	player->character = *it;
	player->character->CalculateStats();

	std::string guild_str = player->character->GuildNameString();
	std::string guild_rank = player->character->GuildRankString();

	PacketBuilder reply(PACKET_WELCOME, PACKET_REPLY,
		114 + player->character->paperdoll.size() * 2 + player->character->SourceName().length() + player->character->title.length()
		+ guild_str.length() + guild_rank.length());

	reply.AddShort(1); // REPLY_WELCOME sub-id
	reply.AddShort(player->id);
	reply.AddInt(player->character->id);
	reply.AddShort(player->character->mapid); // Map ID

	if (player->world->config["GlobalPK"] && !player->world->PKExcept(player->character->mapid))
	{
		reply.AddByte(0xFF);
		reply.AddByte(0x01);
	}
	else
	{
		reply.AddByte(player->world->GetMap(player->character->mapid)->rid[0]);
		reply.AddByte(player->world->GetMap(player->character->mapid)->rid[1]);
	}

	reply.AddByte(player->world->GetMap(player->character->mapid)->rid[2]);
	reply.AddByte(player->world->GetMap(player->character->mapid)->rid[3]);
	reply.AddThree(player->world->GetMap(player->character->mapid)->filesize);
	reply.AddByte(player->world->eif->rid[0]);
	reply.AddByte(player->world->eif->rid[1]);
	reply.AddByte(player->world->eif->rid[2]);
	reply.AddByte(player->world->eif->rid[3]);
	reply.AddByte(player->world->eif->len[0]);
	reply.AddByte(player->world->eif->len[1]);
	reply.AddByte(player->world->enf->rid[0]);
	reply.AddByte(player->world->enf->rid[1]);
	reply.AddByte(player->world->enf->rid[2]);
	reply.AddByte(player->world->enf->rid[3]);
	reply.AddByte(player->world->enf->len[0]);
	reply.AddByte(player->world->enf->len[1]);
	reply.AddByte(player->world->esf->rid[0]);
	reply.AddByte(player->world->esf->rid[1]);
	reply.AddByte(player->world->esf->rid[2]);
	reply.AddByte(player->world->esf->rid[3]);
	reply.AddByte(player->world->esf->len[0]);
	reply.AddByte(player->world->esf->len[1]);
	reply.AddByte(player->world->ecf->rid[0]);
	reply.AddByte(player->world->ecf->rid[1]);
	reply.AddByte(player->world->ecf->rid[2]);
	reply.AddByte(player->world->ecf->rid[3]);
	reply.AddByte(player->world->ecf->len[0]);
	reply.AddByte(player->world->ecf->len[1]);
	reply.AddBreakString(player->character->SourceName());
	reply.AddBreakString(player->character->title);
	reply.AddBreakString(guild_str); // Guild Name
	reply.AddBreakString(guild_rank); // Guild Rank
	reply.AddChar(player->character->clas);
	reply.AddString(player->character->PaddedGuildTag());

	// Tell a player's client they're a higher level admin than they are to enable some features

	AdminLevel lowest_command = ADMIN_HGM;

	UTIL_FOREACH(player->world->admin_config, ac)
	{
		if (ac.first == "killnpc" || ac.first == "reports")
		{
			continue;
		}

		lowest_command = std::min<AdminLevel>(lowest_command, static_cast<AdminLevel>(util::to_int(ac.second)));
	}

	if (player->character->SourceAccess() >= static_cast<int>(player->world->admin_config["seehide"])
	 && player->character->SourceAccess() < ADMIN_HGM)
	{
		reply.AddChar(ADMIN_HGM);
	}
	else if (player->character->SourceDutyAccess() >= static_cast<int>(player->world->admin_config["nowall"])
	 && player->character->SourceDutyAccess() < ADMIN_GM)
	{
		reply.AddChar(ADMIN_GM);
	}
	else if (player->character->SourceAccess() >= lowest_command && player->character->SourceAccess() < ADMIN_GUIDE)
	{
		reply.AddChar(ADMIN_GUIDE);
	}
	else
	{
		reply.AddChar(player->character->SourceAccess());
	}

	reply.AddChar(player->character->level);
	reply.AddInt(player->character->exp);
	reply.AddInt(player->character->usage);
	reply.AddShort(player->character->hp);
	reply.AddShort(player->character->maxhp);
	reply.AddShort(player->character->tp);
	reply.AddShort(player->character->maxtp);
	reply.AddShort(player->character->maxsp);
	reply.AddShort(player->character->statpoints);
	reply.AddShort(player->character->skillpoints);
	reply.AddShort(player->character->karma);
	reply.AddShort(player->character->mindam);
	reply.AddShort(player->character->maxdam);
	reply.AddShort(player->character->accuracy);
	reply.AddShort(player->character->evade);
	reply.AddShort(player->character->armor);

	if (!player->world->config["OldVersionCompat"] && player->client->version < 28)
	{
		reply.AddChar(player->character->display_str);
		reply.AddChar(player->character->display_wis);
		reply.AddChar(player->character->display_intl);
		reply.AddChar(player->character->display_agi);
		reply.AddChar(player->character->display_con);
		reply.AddChar(player->character->display_cha);
	}
	else
	{
		reply.AddShort(player->character->display_str);
		reply.AddShort(player->character->display_wis);
		reply.AddShort(player->character->display_intl);
		reply.AddShort(player->character->display_agi);
		reply.AddShort(player->character->display_con);
		reply.AddShort(player->character->display_cha);
	}

	UTIL_FOREACH(player->character->paperdoll, item)
	{
		reply.AddShort(item);
	}

	int leader_rank = std::max(std::max(std::max(static_cast<int>(player->world->config["GuildEditRank"]), static_cast<int>(player->world->config["GuildKickRank"])),
							   static_cast<int>(player->world->config["GuildPromoteRank"])), static_cast<int>(player->world->config["GuildDemoteRank"]));

	if (player->character->guild_rank <= leader_rank && player->character->guild)
	{
		reply.AddChar(1); // Allows client access to the guild management tools
	}
	else
	{
		reply.AddChar(player->character->guild_rank);
	}

	reply.AddShort(static_cast<int>(player->world->config["JailMap"]));
	reply.AddShort(4); // ?
	reply.AddChar(24); // ?
	reply.AddChar(24); // ?
	reply.AddShort(0); // Light guide admin command flood rate
	reply.AddShort(0); // Guardian admin command flood rate
	reply.AddShort(0); // GM/HGM admin command flood rate
	reply.AddShort(2); // ?
	reply.AddChar((player->character->usage == 0) ? 2 : 0); // Login warning message
	reply.AddByte(255);

	player->Send(reply);
*/