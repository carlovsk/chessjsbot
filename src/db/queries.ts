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
