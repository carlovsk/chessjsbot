import { Chess, ChessInstance } from 'chess.js'
import { PutItem, Query, DeleteItem, buildKeys, gameStatus } from "../ddb"
import { sendMessage } from "../services"
import { buildBoardMessage, getCommandAndText } from "../utils"
import { debug } from "../core"


const choseRandomMove = (moves: string[]) => moves[Math.floor(Math.random() * moves.length)]

const getOverReason = (fen: string) => {
  const chess = new Chess(fen)
  const winner = chess.turn() === 'w' ? 'Black' : 'White'

  //  > Checkmate
  if (chess.in_checkmate()) {
    return {
      winner,
      reason: 'Checkmate!'
    }
  }
  //  > Stalemate
  if (chess.in_stalemate()) {
    return {
      winner,
      reason: 'Stalemate!'
    }
  }
  //  > Draw - 50-move rule or insufficient material
  if (chess.in_draw()) {
    return {
      winner: 'draw',
      reason: 'Draw!'
    }
  }
  //  > Draw by repetition
  if (chess.in_threefold_repetition()) {
    return {
      winner: 'draw',
      reason: 'Draw by repetition!'
    }
  }
}

const finishGame = async (game: ChessInstance, gameId: string, playerId: string) => {
  const { winner, reason } = getOverReason(game.fen())
  await DeleteItem({ ...buildKeys.game({ playerId, gameId }) })
  await PutItem({
    ...buildKeys.game({ playerId, status: gameStatus.finished, gameId }),
    gameId,
    board: game.fen(),
    pgn: game.pgn(),
    winner,
    reason
  })

  await sendMessage(`${reason}\nThe winner is: **${winner}**`, playerId)
}

const messages = {
  noMove: 'Please, type in a valid move like `/move e6`.',
  invalidMove: (move: string) => `The move \`${move}\` is not allowed.\nTry the command \`/availablemoves\` to check on what you could do.`,
  noGameRunning: 'There is no game running. You can start a new one with `/newgamebot`.',
  board: (fen: string, moveNumber: number, move: string) => {
    const board = new Chess(fen)
    console.log(board.turn())
    const player = board.turn() === 'w' ? 'Black' : 'White'
    return `Move ${moveNumber}: \`${move}\` (${player})\n\n${buildBoardMessage(board.ascii())}`
  },
  playerCheckmate: 'Checkmate!\nYou won the game. Congrats 🎉'
}

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat

  // Query if user has a game running
  const [isGameRunning] = await Query({ ...buildKeys.game({ playerId: id }) })
  //   If not, return validation message
  if (!isGameRunning) {
    await sendMessage(messages.noGameRunning, id)
    return
  }

  const { gameId } = isGameRunning
  const { text: move } = getCommandAndText(payload.message.text)
  // Check if move is given
  //   If not, return validation message
  if (!move) {
    await sendMessage(messages.noMove, id)
    return
  }

  const allMoves = await Query({
    pk: `${isGameRunning.gameId}`,
    sk: 'move-',
    attributes: ['sk', 'board', 'move', 'moveIdx']
  })
  const qtdMoves = allMoves.length

  const game = new Chess()

  if (qtdMoves > 0) {
    // Loading all the previous moves
    allMoves.sort((a, b) => a.moveIdx - b.moveIdx).forEach(({ move }) => game.move(move))
    debug('commands:move')('game history %o', game.history({ verbose: true }))
  }

  // Check if move is valid
  //   If not, return validation message
  if (!game.moves().includes(move)) {
    debug('commands:move')('move %o availableMoves %o', move, game.moves())
    await sendMessage(messages.invalidMove(move), id)
    return
  }

  // Do move
  game.move(move)
  // Store move
  await PutItem({
    pk: `${gameId}`,
    sk: `move-${qtdMoves + 1}`,
    moveIdx: qtdMoves + 1,
    move,
    gameId,
    player: id,
    board: game.fen()
  })
  // Send message
  await sendMessage(messages.board(game.fen(), qtdMoves + 1, move), id)

  // Check if bot is in:
  if (game.game_over()) return await finishGame(game, gameId, id)
  if (game.in_check()) await sendMessage('Check!', id)

  // Do move
  const botMove = choseRandomMove(game.moves())
  game.move(botMove)
  // Store move
  await PutItem({
    pk: `${gameId}`,
    moveIdx: qtdMoves + 2,
    sk: `move-${qtdMoves + 2}`,
    gameId,
    move: botMove,
    player: 'bot',
    board: game.fen()
  })
  // Send message
  await sendMessage(messages.board(game.fen(), qtdMoves + 2, botMove), id)

  if (game.game_over()) return await finishGame(game, gameId, id)
  if (game.in_check()) await sendMessage('Check!', id)
}
