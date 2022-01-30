import { Chess } from '../lib/chess'
import { Payload } from '../types/payload'
import { movesByGameId, playersByGameId, gameRunningByPlayerId } from '../db/queries'
import { finishGame } from '../db/functions'
import { sendMessage } from '../services'

export default async (payload: Payload): Promise<void> => {
  const { id } = payload.message.chat

  const isGameRunning = await gameRunningByPlayerId(id)
  if (!isGameRunning) return sendMessage('There is no game running. You can start a new one with `/newgamebot`.', id)

  const allMoves = await movesByGameId(isGameRunning.gameId)
  const qtdMoves = allMoves.length
  const board = qtdMoves > 0 ? allMoves[qtdMoves - 1].board : isGameRunning.board
  const game = Chess(board)

  const { gameId } = isGameRunning
  const { white, black } = await playersByGameId(gameId)

  await finishGame({
    gameId,
    winner: 'black',
    reason: 'Resignation!',
    game,
    whitePlayer: {
      id: white.id
    },
    blackPlayer: {
      id: black.id
    }
  })
  await sendMessage(`${white.player} has resigned.\n${black.player} is the winner!`, id)
}
