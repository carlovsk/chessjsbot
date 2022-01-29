import { buildKeys, gameStatus } from './constants'
import { Query } from './dynamodb'

export const gameRunningByPlayerId = async (playerId: string) => {
  const [isGameRunning] = await Query({
    ...buildKeys.game({ playerId, status: gameStatus.running })
  })
  return isGameRunning
}

export const userById = async (userId: string) => {
  const [user] = await Query({
    pk: 'user',
    sk: userId
  })
  return user
}

export const movesByGameId = async (gameId: string) => {
  const moves = await Query({
    pk: `${gameId}`,
    sk: 'move-',
    attributes: ['sk', 'board', 'move', 'moveIdx']
  })
  return moves
}

export const moveByGameIdAndIndex = async (gameId: string, moveIdx: number) => {
  const [move] = await Query({
    pk: `${gameId}`,
    sk: `move-${moveIdx}`
  })
  return move
}
