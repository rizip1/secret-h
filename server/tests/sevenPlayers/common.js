import {nameToId} from '../common.js'

export const mockedGameCore = {
  id: 'ca7afe65-2615-4c29-bdf5-e44a767bf94e',
  created_by: nameToId.richard,
  number_of_players: 7,
  active: true,
  conf: {
    action: 'chancellor-turn',
    president: nameToId.marek,
    chancellor: nameToId.richard,
    prevPresident: null,
    prevChancellor: null,
    drawPileCount: 14,
    discardPileCount: 1,
    liberalLawsCount: 0,
    fascistsLawsCount: 0,
    voted: [],
    votes: {
      [nameToId.marek]: true,
      [nameToId.richard]: true,
      [nameToId.stano]: true,
      [nameToId.michal]: true,
      [nameToId.andrej]: true,
      [nameToId.ivana]: true,
      [nameToId.katka]: true,
    },
    failedElectionsCount: 0,
    veto: false,
    returnToPrevPresident: false,
    allSelectable: true,
  },
  secret_conf: {
    votes: {},
    remainingLaws: [
      'fascist',
      'fascist',
      'fascist',
      'fascist',
      'liberal',
      'fascist',
      'liberal',
      'fascist',
      'fascist',
      'liberal',
      'liberal',
      'fascist',
      'fascist',
      'liberal',
    ],
    discartedLaws: ['fascist'],
    presidentLaws: [],
    chancellorLaws: ['liberal', 'fascist'],
  },
  players: {
    [nameToId.marek]: {
      id: nameToId.marek,
      login: 'Marek Sabov',
      killed: false,
      race: 'hitler',
      order: 1,
    },
    [nameToId.richard]: {
      killed: false,
      id: nameToId.richard,
      login: 'Richard Izip',
      race: 'liberal',
      order: 2,
    },
    [nameToId.stano]: {
      killed: false,
      id: nameToId.stano,
      login: 'Stano Bernat',
      race: 'liberal',
      order: 3,
    },
    [nameToId.michal]: {
      killed: false,
      id: nameToId.michal,
      login: 'Michal Racko',
      race: 'liberal',
      order: 4,
    },
    [nameToId.andrej]: {
      killed: false,
      id: nameToId.andrej,
      login: 'Andrej Sabov',
      race: 'liberal',
      order: 5,
    },
    [nameToId.ivana]: {
      killed: false,
      id: nameToId.ivana,
      login: 'ivana',
      race: 'fascist',
      order: 6,
    },
    [nameToId.katka]: {
      killed: false,
      id: nameToId.katka,
      login: 'katka',
      race: 'fascist',
      order: 7,
    },
  },
}
