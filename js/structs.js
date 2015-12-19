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
  }
};
