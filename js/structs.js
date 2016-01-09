/*
 * structs.js - EO Data Structures
 */

module.exports = {
	adminLevel: {
		PLAYER: 0,
		GUIDE: 1,
		GUARDIAN: 2,
		GM: 3,
		HGM: 4
	},
	
	direction: {
		DOWN: 0,
		LEFT: 1,
		UP: 2,
		RIGHT: 3
	},
	
	emote: {
		happy: 1,
		depressed: 2,
		sad: 3,
		angry: 4,
		confused: 5,
		surprised: 6,
		hearts: 7,
		moon: 8,
		suicidal: 9,
		embarassed: 10,
		drunk: 11,
		trade: 12,
		levelUp: 13,
		playful: 14
	},
	
	questPage: {
		progress: 1,
		history: 2
	},
	
	gender: {
		female: 0,
		male: 1
	},
	
	skin: {
		white: 0,
		tan: 1,
		pale: 2,
		orc: 3,
		skeleton: 4,
		panda: 5,
		fish: 6
	},
	
	paperDollIcon: {
		normal: 0,
		gm: 4,
		hgm: 5,
		party: 6,
		gmParty: 9,
		hgmParty: 10,
		slnBot: 20
	},
	
	avatarSlots: {
		clothes: 1,
		hair: 2,
		hairColor: 3
	},
	
	talkReply: {
		notFound: 1
	},
	
	sitState: {
		stand: 0,
		chair: 1,
		floor: 2
	},
	
	sitAction: {
		sit: 1,
		stand: 2
	},
	
	trainType: {
		stat: 1,
		skill: 2
	},
	
	bookIcon: {
		item: 3,
		talk: 5,
		kill: 8,
		step: 10
	},
	
	fileType: {
		map: 1,
		item: 2,
		npc: 3,
		spell: 4,
		class: 5
	},
	
	initReply: {
		outOfDate: 1,
		ok: 2,
		banned: 3,
		fileMap: 4,
		fileEIF: 5,
		fileENF: 6,
		fileESF: 7,
		players: 8,
		mapMutation: 9,
		friendListPlayers: 10,
		fileECF: 11
	},
	
	initBanType: {
		temp: 0,
		perm: 2
	},
	
	ENFType: {
		NPC: 0,
		Passive: 1,
		Aggressive: 2,
		Unknown1: 3,
		Unknown2: 4,
		Unknown3: 5,
		Shop: 6,
		Inn: 7,
		Unknown4: 8,
		Bank: 9,
		Barber: 10,
		Guild: 11,
		Priest: 12,
		Law: 13,
		Skills: 14,
		Quest: 15
	},
	
	spellTarget: {
		invalid: 0,
		self: 1,
		npc: 2,
		player: 3,
		group: 4
	},
	
	warpAnimation: {
		none: 0,
		scroll: 1,
		admin: 2,
		invalid: 255
	},
	
	equipmentLocation: {
		boots: 0,
		accessory: 1,
		gloves: 2,
		belt: 3,
		armor: 4,
		necklace: 5,
		hat: 6,
		shield: 7,
		weapon: 8,
		ring1: 9,
		ring2: 10,
		armlet1: 11,
		armlet2: 12,
		bracer1: 13,
		bracer2: 14
	},
	
	EIFType: {
		static: 0,
		unknownType1: 1,
		money: 2,
		heal: 3,
		teleport: 4,
		spell: 5,
		expReward: 6,
		statReward: 7,
		skillReward: 8,
		key: 9,
		weapon: 10,
		shield: 11,
		armor: 12,
		hat: 13,
		boots: 14,
		gloves: 15,
		accessory: 16,
		belt: 17,
		necklace: 18,
		ring: 19,
		armlet: 20,
		bracer: 21,
		beer: 22,
		effectPotion: 23,
		hairDye: 24,
		cureCurse: 25
	},
	
	EIFSubType: {
		none: 0,
		ranged: 1,
		arrows: 2,
		wings: 3,
		twoHanded: 4
	},
	
	EIFSpecial: {
		normal: 0,
		rare: 1,
		unknownSpecial: 2,
		unique: 3,
		lore: 4,
		cursed: 5
	},
	
	EIFSize: {
		oneByOne: 0,
		oneByTwo: 1,
		oneByThree: 2,
		oneByFour: 3,
		twoByOne: 4,
		twoByTwo: 5,
		twoByThree: 6,
		twoByFour: 7
	},
	
	walkResult: {
		fail: 0,
		ok: 1,
		warped: 2
	},
	
	tileSpec: {
		none: -1,
		wall: 0,
		chairDown: 1,
		chairLeft: 2,
		chairRight: 3,
		chairUp: 4,
		chairDownRight: 5,
		chairUpLeft: 6,
		chairAll: 7,
		door: 8,
		chest: 9,
		unknown1: 10,
		unknown2: 11,
		unknown3: 12,
		unknown4: 13,
		unknown5: 14,
		unknown6: 15,
		bankVault: 16,
		npcBoundary: 17,
		mapEdge: 18,
		fakeWall: 19,
		board1: 20,
		board2: 21,
		board3: 22,
		board4: 23,
		board5: 24,
		board6: 25,
		board7: 26,
		board8: 27,
		jukebox: 28,
		jump: 29,
		water: 30,
		unknown7: 31,
		arena: 32,
		ambientSource: 33,
		spikes1: 34,
		spikes2: 35,
		spikes3: 36
	},
	
	warpType: {
		local: 1,
		switch: 2
	},
	
	warpSpec: {
		NoDoor: 0,
		Door: 1,
		LockedSilver: 2,
		LockedCrystal: 3,
		LockedWraith: 4
	},

	targetRestrict: {
	    NPCOnly: 0,
	    Friendly: 1,
        Opponent: 2
	}
};
