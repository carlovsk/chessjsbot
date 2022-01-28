import { Chess } from 'chess.js'
import { Query } from "../ddb"
import { sendMessage } from "../services"

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat

  const [isGameRunning] = await Query({
    pk: 'game',
    sk: `${id}-`
  })

  if (!isGameRunning) {
    await sendMessage('There is no game running. You can start a new one with `/newgamebot`.', id)
    return
  }

  const allMoves = await Query({ pk: `${isGameRunning.gameId}`, sk: 'move-', attributes: ['sk'] })
  const qtdMoves = allMoves.length

  const [{ board }] = await Query({ pk: `${isGameRunning.gameId}`, sk: `move-${qtdMoves}` })

  const game = new Chess(board)
  const moves = game.moves().map(move => `\`${move}\``).join(', ')

  return sendMessage(moves, id)
}

