import { Chess } from '../lib/chess'
import { startGame } from '../db/functions'
import { gameRunningByPlayerId } from '../db/queries'
import { sendMessage } from "../services"
import { buildBoardMessage } from "../utils"
import { Payload } from '../types/payload'

export default async (payload: Payload): Promise<void> => {
  const { id } = payload.message.chat
  const player = payload.message.from.first_name

  // Verify if a game is already running
  const isGameRunning = await gameRunningByPlayerId(id)
  if (isGameRunning) return sendMessage('You already have a game running.', id)

  await sendMessage(`Great! Starting the game...`, id)

  const whitePlayer = { name: player, id: id }
  const blackPlayer = { name: 'ChessJs Bot', id: 'bot' }

  await sendMessage(`**${whitePlayer.name}** (white) vs. **${blackPlayer.name}** (black)`, id)

  const game = Chess()

  await startGame({
    fen: game.fen(),
    whitePlayer,
    blackPlayer
  })

  await sendMessage(buildBoardMessage(game.ascii()), id)
  await sendMessage('You start as white :)', id)
}
