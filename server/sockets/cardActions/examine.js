import {ioServer} from '../../server.js'
import knex from '../../knex/knex.js'
import {getGame, emitSocketError} from '../../utils.js'
import {handleGovernmentChange} from '../utils.js'

export const examineFinished = (socket) => async () => {
  socket.log.info('Top 3 cards examination finished')
  const {gameId, playerId} = socket
  const game = await getGame(gameId)

  if (
    !game.active ||
    game.conf.action !== 'examine' ||
    playerId !== game.conf.president
  ) {
    emitSocketError(socket)
    return
  }

  const updatedGame = handleGovernmentChange(game)
  await knex('games').where({id: game.id}).update(updatedGame)
  ioServer.in(game.id).emit('fetch-data')
}
