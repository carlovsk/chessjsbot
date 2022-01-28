import { Chess } from 'chess.js'
import { startGame, Query, buildKeys } from "../ddb"
import { sendMessage } from "../services"
import { buildBoardMessage } from "../utils"

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  const player = payload.message.from.first_name

  // Verify if a game is already running
  const [isGameRunning] = await Query({ ...buildKeys.game({ playerId: id }) })
  if (isGameRunning) return sendMessage('You already have a game running.', id)

  await sendMessage(`Great! Starting the game...`, id)
  await sendMessage(`**${player}** (white) vs. **Bot** (black)`, id)

  const game = new Chess()

  await startGame({
    fen: game.fen(),
    whitePlayer: { name: player, id: id },
    blackPlayer: { name: 'bot', id: 'bot' }
  })

  await sendMessage(buildBoardMessage(game.ascii()), id)
  await sendMessage('You start as white :)', id)
}
