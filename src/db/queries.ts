import { buildKeys, gameStatus, entities, colors } from './constants'
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

export const playersByGameId = async (gameId: string) => {
  const players = await Query({
    pk: `${gameId}`,
    sk: entities.player
  })
  const white = players.find(player => player.playingAs === colors.w) || {}
  const black = players.find(player => player.playingAs === colors.b) || {}

  // TODO: remove this
  white.id ? '' : white.id = white.sk?.split('-')[1]
  black.id ? '' : black.id = black.sk?.split('-')[1]

  return { white, black }
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
