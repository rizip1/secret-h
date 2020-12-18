import _ from 'lodash'

import {ioServer} from '../server.js'
import knex from '../knex/knex.js'
import {emitError} from './utils.js'

const alreadyJoined = async (playerId, gameId) => {
  return !!(await knex('player_to_game').where({game_id: gameId, player_id: playerId}).first())
}

const joinGame = async (socket) => {
  const {playerId, gameId} = socket

  const registeredPlayers = await knex('player_to_game').where({game_id: gameId})
  const gamePlayersCount = (await knex('games').first('number_of_players').where({id: gameId})).number_of_players

  if (gamePlayersCount === undefined) {
    throw new Error('Game does not exist')
  }

  // the game is already full
  if (registeredPlayers.length === gamePlayersCount) {
    throw new Error('Game is full')
  }

  // remove player from all other games
  await knex('player_to_game').del().where({player_id: playerId})

  // add player to game
  await knex('player_to_game').insert({
    player_id: playerId,
    game_id: gameId,
  })

  socket.to(gameId).emit('other-player-joined', {
    gameId,
    playerId
  })

  // all players registered, set random players order
  if (registeredPlayers.length === gamePlayersCount - 1) {
    const orders = _.shuffle(_.range(1, gamePlayersCount + 1))
    const records = await knex('player_to_game').select('*').where({game_id: gameId})
    
    records.forEach(async (r, index) => {
      await knex('player_to_game').where({player_id: r.player_id, game_id: r.game_id}).update({order: orders[index]})
    })

    // mark game as ready
    await knex('games').where({id: gameId}).update({is_ready: true})

    // send to all, including sender
    ioServer.in(gameId).emit('game-ready', {gameId})
  }
}

export const init = async (socket) => {
  const {playerId, gameId} = socket

  const joined = await alreadyJoined(playerId, gameId)

  const onSuccess = () => {
    socket.join(socket.gameId)
    socket.emit('joined-game', {id: gameId})
  }

  if (joined) {
    onSuccess()
  } else {
    try {
      await joinGame(socket)
      onSuccess()
    } catch (err) {
      emitError(socket)
    }
  }
}
