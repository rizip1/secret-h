import _ from 'lodash'
import knex from '../knex/knex.js'

export const getData = (socket) => async () => {
  const {gameId, playerId} = socket

  const gameInfo = await knex('games')
    .select(
      'id',
      'number_of_players',
      'active',
      'conf',
      'players',
      'secret_conf'
    )
    .where({id: gameId})
    .first()

  const playerRace = gameInfo.players[playerId].race
  const playersCount = _.size(gameInfo.players)

  const playersInfo = (() => {
    let res = gameInfo.players

    // Till game is not active there are no roles and players order
    if (
      (gameInfo.active &&
        gameInfo.conf.action !== 'results' &&
        playerRace === 'liberal') ||
      (playerRace === 'hitler' && playersCount > 6)
    ) {
      res = _.mapValues(res, (p) => ({
        ...p,
        race: p.id === playerId ? p.race : 'unknown',
      }))
    }

    return res
  })()

  const extras = (() => {
    if (!gameInfo.active) return {}

    if (
      ['president-turn', 'president-turn-veto'].includes(
        gameInfo.conf.action
      ) &&
      gameInfo.conf.president === playerId
    ) {
      return {presidentLaws: gameInfo.secret_conf.presidentLaws}
    }

    if (
      ['chancellor-turn', 'chancellor-turn-veto'].includes(
        gameInfo.conf.action
      ) &&
      gameInfo.conf.chancellor === playerId
    ) {
      return {chancellorLaws: gameInfo.secret_conf.chancellorLaws}
    }

    if (
      gameInfo.conf.action === 'examine' &&
      gameInfo.conf.president === playerId
    ) {
      return {topCards: gameInfo.secret_conf.remainingLaws.slice(0, 3)}
    }

    if (
      gameInfo.conf.action === 'investigate' &&
      gameInfo.conf.president === playerId
    ) {
      return {investigateInfo: gameInfo.secret_conf.investigateInfo}
    }
    return {}
  })()

  socket.emit('game-data', {
    gameInfo: _.omit(gameInfo, 'secret_conf'),
    playersInfo,
    extras,
    playerId,
  })
}
