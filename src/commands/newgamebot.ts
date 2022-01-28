import { Chess } from 'chess.js'
import { PutItem,Query } from "../ddb"
import { sendMessage } from "../services"
import { buildBoardMessage, makeId } from "../utils"

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  const player = payload.message.from.first_name

  // Verify if a game is already running
  const [isGameRunning] = await Query({
    pk: 'game',
    sk: `${id}-`
  })
  if (isGameRunning) {
    await sendMessage('You already have a game running.', id)
    return
  }

  await sendMessage(`Great! Starting the game...`, id)
  await sendMessage(`**${player}** (whites) vs. **Bot** (blacks)`, id)

  const game = new Chess()
  const gameId = makeId()
  const fen = game.fen()

  // store game
  await PutItem({ pk: 'game', sk: gameId, board: fen })
  await PutItem({ pk: 'game', sk: `${id}-${gameId}`, gameId, board: fen })

  // store players
  await PutItem({ pk: `${gameId}`, sk: `player-${id}`, gameId, player })
  await PutItem({ pk: `${gameId}`, sk: `player-bot`, gameId, player: 'bot' })

  await sendMessage(buildBoardMessage(game.ascii()), id)
  await sendMessage('You start as whites :)', id)
}
