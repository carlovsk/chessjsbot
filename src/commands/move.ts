import { Chess } from 'chess.js'
import { PutItem, Query } from "../ddb"
import { sendMessage } from "../services"
import { getCommandAndText } from "../utils"

const buildBoardMessage = (board: string) => `\`\`\`js\n${board}\n\`\`\``
const choseRandomMove = (moves: string[]) => moves[Math.floor(Math.random() * moves.length)]

const messages = {
  noMove: 'Please, type in a valid move like `/move e6`.',
  invalidMove: (move: string) => `The move \`${move}\` is not allowed.\nTry the command \`/availablemoves\` to check on what you could do.`,
  noGameRunning: 'There is no game running. You can start a new one with `/newgamebot`.',
  board: (b: string, moveNumber: number, move: string) => `${moveNumber}. ${move}\n${buildBoardMessage(b)}`,
  playerCheckmate: 'Checkmate!\nYou won the game. Congrats 🎉'
}

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat

  // Query if user has a game running
  const [isGameRunning] = await Query({
    pk: 'game',
    sk: `${id}-`
  })
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
    attributes: ['sk']
  })
  const qtdMoves = allMoves.length

  const [lastMove] = await Query({
    pk: `${isGameRunning.gameId}`,
    sk: `move-${qtdMoves}`
  })
  const { board } = qtdMoves === 0 ? isGameRunning : lastMove
  const game = new Chess(board)

  // Check if move is valid
  //   If not, return validation message
  if (!game.moves().includes(move)) {
    await sendMessage(messages.invalidMove(move), id)
    return
  }

  // Do move
  game.move(move)
  // Store move
  await PutItem({
    pk: `${gameId}`,
    sk: `move-${qtdMoves + 1}`,
    move,
    gameId,
    player: id,
    board: game.fen()
  })
  // Send message
  await sendMessage(messages.board(game.ascii(), qtdMoves + 1, move), id)

  // Check if bot is in:
  //   > Check
  //   > Checkmate
  if (game.in_checkmate()) {
    await sendMessage(messages.playerCheckmate, id)
    return
  }
  //   > Stalemate
  //   > Draw
  //   > Draw by repetition
  //   If so, return message and store game as finished


  // Do move
  const botMove = choseRandomMove(game.moves())
  game.move(botMove)
  // Store move
  await PutItem({
    pk: `${gameId}`,
    sk: `move-${qtdMoves + 2}`,
    gameId,
    move: botMove,
    player: 'bot',
    board: game.fen()
  })
  // Send message
  await sendMessage(messages.board(game.ascii(), qtdMoves + 2, botMove), id)

  // Check if player is in:
  //   > Check
  //   > Checkmate
  //   > Stalemate
  //   > Draw
  //   > Draw by repetition
  //   If so, return message
}
