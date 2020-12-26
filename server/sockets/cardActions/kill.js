import _ from 'lodash'

import {ioServer} from '../../server.js'
import knex from '../../knex/knex.js'
import {getGame, emitSocketError} from '../../utils.js'
import {handleGovernmentChange, handleGameOver} from '../utils.js'
import {log} from '../../logger.js'

export const kill = (socket) => async (data) => {
  log.info('Killing player', data.id)
  const {gameId, playerId} = socket

  const game = await getGame(gameId)

  if (
    !game.active ||
    game.conf.action !== 'kill' ||
    playerId !== game.conf.president
  ) {
    emitSocketError(socket)
    return
  }

  const updatedPlayers = _.mapValues(game.players, (p) =>
    p.id === data.id ? {...p, killed: true} : p
  )

  const updatedConf = handleGameOver(game.conf, updatedPlayers)

  const transformer =
    updatedConf.action !== 'results' ? handleGovernmentChange : (i) => i

  const updatedGame = transformer({
    ...game,
    conf: handleGameOver(game.conf, updatedPlayers),
    players: updatedPlayers,
  })
  await knex('games').where({id: game.id}).update(updatedGame)

  ioServer.in(game.id).emit('fetch-data')
}