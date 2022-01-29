import { makeId } from '../utils'
import { User } from '../types/payload'
import { ChessInstance } from '../types/chess'
import { buildKeys, gameStatus } from './constants'
import { PutItem, DeleteItem } from './dynamodb'

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

export const storeMove = async ({ gameId, playerId, move, moveIdx, board }: {
  gameId: string
  playerId: string
  move: string
  moveIdx: number
  board: string
}) => {
  await PutItem({ ...buildKeys.move(gameId, moveIdx), gameId, moveIdx, move, player: playerId, board })
}

export const saveUser = async (user: User) => {
  await PutItem({
    pk: 'user',
    sk: `${user.id}`,
    ...user,
    startedAt: new Date().toISOString()
  })
}

export const finishGame = async ({ whitePlayer, blackPlayer, gameId, winner, reason, game }: {
  game: ChessInstance
  whitePlayer: { id: string }
  blackPlayer: { id: string }
  gameId: string
  winner: string
  reason: string
}) => {
  const gameParams = {
    gameId,
    board: game.fen(),
    pgn: game.pgn(),
    winner,
    reason
  }

  await DeleteItem({ ...buildKeys.game({ playerId: whitePlayer.id, gameId }) })
  await DeleteItem({ ...buildKeys.game({ playerId: blackPlayer.id, gameId }) })

  await PutItem({
    ...buildKeys.game({ playerId: whitePlayer.id, status: gameStatus.finished, gameId }),
    ...gameParams
  })
  await PutItem({
    ...buildKeys.game({ playerId: blackPlayer.id, status: gameStatus.finished, gameId }),
    ...gameParams
  })
}

