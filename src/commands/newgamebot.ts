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
  await sendMessage(`**${player}** (white) vs. **Bot** (black)`, id)

  const game = Chess()

  await startGame({
    fen: game.fen(),
    whitePlayer: { name: player, id: id },
    blackPlayer: { name: 'bot', id: 'bot' }
  })

  await sendMessage(buildBoardMessage(game.ascii()), id)
  await sendMessage('You start as white :)', id)
}
