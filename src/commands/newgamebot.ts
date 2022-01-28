import { Chess } from 'chess.js'
import { PutItem, Query, buildKeys } from "../ddb"
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
  await PutItem({ ...buildKeys.game(id, gameId), gameId, board: fen })

  // store players
  await PutItem({ ...buildKeys.player(id, gameId), gameId, player, playingAs: 'whites' })
  await PutItem({ ...buildKeys.player('bot', gameId), gameId, player: 'bot', playingAs: 'blacks' })

  await sendMessage(buildBoardMessage(game.ascii()), id)
  await sendMessage('You start as whites :)', id)
}
