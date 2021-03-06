import _ from 'lodash'
import knex from './knex/knex.js'
import {raceConfigurations} from 'common/constants.js'
import {log} from './logger.js'

export const logActiveGamesIds = async () => {
  const activeGames = await knex('games').select('id').where({
    active: true,
  })
  log.info('ACTIVE GAMES', activeGames)
}

export const assignRacesAndOrder = (players) => {
  const numberOfPlayers = Object.keys(players).length
  const orders = _.shuffle(_.range(1, numberOfPlayers + 1))

  const conf = raceConfigurations[numberOfPlayers].races

  const races = _.shuffle([
    ..._.fill(Array(conf['liberal']), 'liberal'),
    ..._.fill(Array(conf['fascist'] - 1), 'fascist'),
    ...['hitler'],
  ])

  return _.fromPairs(
    _.toPairs(players).map(([id, data], index) => [
      id,
      {...data, race: races[index], order: orders[index]},
    ])
  )
}

export const getInitialGameConf = (players, active = true) => ({
  action: active ? 'choose-chancellor' : null,
  president: active
    ? Object.values(players).find((p) => p.order === 1).id
    : null,
  chancellor: null,
  prevPresident: null,
  prevChancellor: null,
  drawPileCount: 17,
  discardPileCount: 0,
  liberalLawsCount: 0,
  fascistsLawsCount: 0,
  voted: [],
  votes: {},
  failedElectionsCount: 0,
  veto: false,
  returnToPrevPresident: false,
  allSelectable: true,
  investigated: [],
})

export const generateLaws = () => {
  return _.shuffle([
    ..._.range(0, 6).map(() => 'liberal'),
    ..._.range(0, 11).map(() => 'fascist'),
  ])
}

export const getPlayer = async (id) => {
  return await knex('players')
    .select('id', 'login')
    .where({
      id,
    })
    .first()
}

export const getGame = async (id) => {
  return await knex('games')
    .select('*')
    .where({
      id,
    })
    .first()
}

export const emitSocketError = (socket) => {
  socket.emit('socket-error', '')
}
