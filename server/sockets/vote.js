import _ from 'lodash'

import {ioServer} from '../server.js'
import knex from '../knex/knex.js'
import {config} from '../config.js'
import {getGame, getPlayer, emitSocketError} from '../utils.js'
import {
  chooseNextPresident,
  drawRandomLaw,
  handleGameOver,
  getAlivePlayers,
} from './utils.js'

const canVote = async (game, playerId) => {
  const alivePlayers = getAlivePlayers(game.players)
  if (!alivePlayers[playerId]) {
    return false
  }
  if (game.conf.voted.includes(playerId)) {
    return false
  }
  return true
}

const getConfigDuringVote = (game, votes) => {
  const conf = {
    ...game.conf,
    voted: Object.keys(votes),
  }
  const secret_conf = {
    ...game.secret_conf,
    votes,
  }
  return {conf, secret_conf}
}

const getConfigAfterSuccessfullVote = (game, votes) => {
  const presidentLaws = game.secret_conf.remainingLaws.slice(0, 3)
  const remainingLaws = game.secret_conf.remainingLaws.slice(3)

  const conf = {
    ...game.conf,
    action: 'president-turn',
    voted: [],
    votes,
    drawPileCount: remainingLaws.length,
  }
  const secret_conf = {
    ...game.secret_conf,
    votes: {},
    presidentLaws,
    remainingLaws,
  }
  return {conf, secret_conf}
}

const getConfigAfterFailedVote = (game, votes) => {
  if (game.conf.failedElectionsCount === 2) {
    return drawRandomLaw(game, votes)
  }

  const conf = {
    ...game.conf,
    action: 'choose-chancellor',
    voted: [],
    failedElectionsCount: game.conf.failedElectionsCount + 1,
    president: chooseNextPresident(game),
    chancellor: null,
    votes,
  }
  return {conf, secret_conf: {...game.secret_conf, votes: {}}}
}

export const voteTransformer = (playerId, game, data) => {
  const votes = {
    ...game.secret_conf.votes,
    [playerId]: data.vote,
  }
  const alivePlayersCount = _.size(getAlivePlayers(game.players))
  const votedAll = _.size(votes) === alivePlayersCount

  const skipped =
    votedAll &&
    Object.values(votes).filter((v) => v).length * 2 <= alivePlayersCount

  const {conf, secret_conf} = !votedAll
    ? getConfigDuringVote(game, votes)
    : !skipped
    ? getConfigAfterSuccessfullVote(game, votes)
    : getConfigAfterFailedVote(game, votes)

  return {
    game: {
      ...game,
      conf: handleGameOver(conf, game.players),
      secret_conf: secret_conf,
    },
    votedAll,
  }
}

// for quicker testing
export const voteAdmin = (socket) => async (data) => {
  if (!config.dev) {
    return
  }
  const {playerId, gameId} = socket
  const game = await getGame(gameId)
  const player = await getPlayer(playerId)

  const votes = Object.values(game.players)
    .filter((p) => !p.killed)
    .reduce((res, p) => ({...res, [p.id]: data.vote}), {})
  game.secret_conf.votes = votes

  const {game: updatedGame} = voteTransformer(player.id, game, data)
  await knex('games').where({id: game.id}).update(updatedGame)
  ioServer.in(game.id).emit('fetch-data')
}

export const vote = (socket) => async (data) => {
  socket.log.info('Vote', data)
  const {playerId, gameId} = socket
  const game = await getGame(gameId)
  const player = await getPlayer(playerId)

  if (!game.active || game.conf.action !== 'vote') {
    emitSocketError(socket)
    return
  }

  const valid = await canVote(game, player.id)
  if (!valid) {
    emitSocketError(socket)
    return
  }

  const {game: updatedGame, votedAll} = voteTransformer(player.id, game, data)
  await knex('games').where({id: game.id}).update(updatedGame)
  votedAll ? ioServer.in(game.id).emit('fetch-data') : socket.emit('fetch-data')
}
