import { Chess } from '../lib/chess'
import { Payload } from '../types/payload'
import { movesByGameId, gameRunningByPlayerId } from '../db/queries'
import { sendMessage } from '../services'

export default async (payload: Payload): Promise<void> => {
  const { id } = payload.message.chat

  const isGameRunning = await gameRunningByPlayerId(id)
  if (!isGameRunning) return sendMessage('There is no game running. You can start a new one with `/newgamebot`.', id)

  const allMoves = await movesByGameId(isGameRunning.gameId)
  const qtdMoves = allMoves.length

  const board = qtdMoves > 0 ? allMoves[qtdMoves - 1].board : isGameRunning.board
  const game = Chess(board)
  const moves = game.moves().join(', ')

  return sendMessage(moves, id)
}

