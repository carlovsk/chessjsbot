export const entities = {
  user: 'user',
  game: 'game',
  move: 'move',
  player: 'player'
}

export const colors = {
  w: 'white',
  b: 'black',
  white: 'white',
  black: 'black'
}

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
  }),
  move: (gameId: string, moveIdx: number) => ({
    pk: gameId,
    sk: `move-${moveIdx}`
  })
}
