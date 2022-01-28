import { makeId } from '../utils'
import { buildKeys } from './constants'
import { PutItem } from './dynamodb'

export const startGame = async ({ whitePlayer, blackPlayer, fen }: {
  fen: string
  whitePlayer: { name: string, id: string }
  blackPlayer: { name: string, id: string }
}) => {
  const gameId = makeId()

  // store game
  await PutItem({ ...buildKeys.game({ playerId: whitePlayer.id, gameId }), gameId, board: fen })
  await PutItem({ ...buildKeys.game({ playerId: blackPlayer.id, gameId }), gameId, board: fen })

  // store players
  await PutItem({ ...buildKeys.player(whitePlayer.id, gameId), gameId, player: whitePlayer.name, playingAs: 'white' })
  await PutItem({ ...buildKeys.player(blackPlayer.id, gameId), gameId, player: blackPlayer.name, playingAs: 'black' })
}

export const saveUser = async (user: {
  id: string
  first_name: string
  last_name: string
  username: string
}) => {
  await PutItem({
    pk: 'user',
    sk: `${user.id}`,
    ...user,
    startedAt: new Date().toISOString()
  })
}
