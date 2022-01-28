export const gameStatus = {
  running: 'running',
  finished: 'finished'
}

interface GameKeysParams {
  playerId: string
  gameId?: string
  status?: string
}
export const buildKeys = {
  game: ({ playerId, gameId, status = gameStatus.running }: GameKeysParams) => {
    const keys = {
      pk: 'game',
      sk: `${playerId}-${status}`
    }
    if (gameId) keys.sk += `-${gameId}`
    return keys
  },
  player: (playerId: string, gameId: string) => ({
    pk: gameId,
    sk: `player-${playerId}`
  })
}
