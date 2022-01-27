import { Chess } from 'chess.js'
import { setWebhook, sendMessage } from './services'
import { debug } from './core'
import { makeId } from './utils'
import { PutItem, Query } from './ddb'

export const setHooks = async () => {
  const response = await setWebhook(`${process.env.API_GATEWAY_URL}/telegram`)
  return response
}

const buildBoardMessage = (board: string) => `\`\`\`js\n${board}\n\`\`\``
const choseRandomMove = (moves: string[]) => moves[Math.floor(Math.random() * moves.length)]

export const hooks = async event => {
  const payload = event.body && JSON.parse(event.body)
  const isCommand = payload.message.text.startsWith('/')
    && payload.message?.entities[0]?.type === 'bot_command'
  const chatId = payload.message.chat.id

  debug('lambdas:hooks')('payload %o isCommand %o', payload, isCommand)

  // Checking if request is an slash command
  if (!isCommand) return

  const [slashCommand, text] = payload.message.text.split(' ')
  const [, command] = slashCommand.split('/')
  debug('lambdas:hooks')('slashCommand %o command %o text %o', slashCommand, command, text)

  if (command === 'start') {
    await sendMessage(`Welcome!`, chatId)
    await PutItem({
      pk: 'user',
      sk: payload.message.from.username,
      ...payload.message.from
    })
  }

  if (command === 'newgamebot') {
    // verify no game is running
    await sendMessage(`Great! Starting the game...`, chatId)

    const player = payload.message.from.username

    await sendMessage(`**${player}** (blacks) vs. **Bot** (whites)`, chatId)

    const game = new Chess()
    const gameId = makeId()
    const fen = game.fen()
    const firstMove = 'e3'

    // save game
    await PutItem({
      pk: 'game',
      sk: gameId,
      board: fen
    })
    await PutItem({
      pk: 'game',
      sk: `${player}-${gameId}`,
      gameId,
      board: fen
    })

    // save players
    await PutItem({
      pk: `${gameId}`,
      sk: `player-${player}`,
      gameId,
      player
    })
    await PutItem({
      pk: `${gameId}`,
      sk: `player-bot`,
      gameId,
      player: 'bot'
    })

    await sendMessage(buildBoardMessage(game.ascii()), chatId)

    // save first move
    game.move('e3')
    await PutItem({
      pk: `${gameId}`,
      sk: `move-1`,
      gameId,
      player: 'bot',
      move: firstMove,
      board: game.fen()
    })

    await sendMessage(`1. ${firstMove}\n${buildBoardMessage(game.ascii())}`, chatId)
  }

  if (command === 'availablemoves') {
    const player = payload.message.from.username
    const [isGameRunning] = await Query({
      pk: 'game',
      sk: `${player}-`
    })
    if (!isGameRunning) {
      return
    }
    debug('lambdas:hooks')('isGameRunning %j', isGameRunning)
    const qtdMoves = await Query({
      pk: `${isGameRunning.gameId}`,
      sk: 'move-',
      attributes: ['sk']
    })

    const [{ board }] = await Query({
      pk: `${isGameRunning.gameId}`,
      sk: `move-${qtdMoves.length}`
    })

    const game = new Chess(board)
    console.log(game.moves())

    const str = game.moves().map(move => `\`${move}\``).join(', ')
    return sendMessage(`${str}`, chatId)
  }

  if (command === 'move') {
    if (!text) return sendMessage(`Invalid move.\nPlease type in a valid move like \`/move e6\``, chatId)
    // verify a game is running
    const player = payload.message.from.username
    const [isGameRunning] = await Query({
      pk: 'game',
      sk: `${player}-`
    })
    if (!isGameRunning) {
      return
    }
    debug('lambdas:hooks')('isGameRunning %j', isGameRunning)
    const { gameId } = isGameRunning
    const qtdMoves = await Query({
      pk: `${isGameRunning.gameId}`,
      sk: 'move-',
      attributes: ['sk']
    })

    const [{ board }] = await Query({
      pk: `${isGameRunning.gameId}`,
      sk: `move-${qtdMoves.length}`
    })
    const nextMovePos = qtdMoves.length + 1

    const game = new Chess(board)

    const move = text
    // check if move is allowed
    if (!game.moves().includes(move)) {
      return sendMessage(`The move \`${move}\` is not allowed.\nTry the command \`/availablemoves\` to check on what you could do.`, chatId)
    }

    game.move(move)

    await PutItem({
      pk: `${gameId}`,
      sk: `move-${nextMovePos}`,
      move,
      gameId,
      player,
      board: game.fen()
    })

    await sendMessage(`${nextMovePos}. ${move}\n${buildBoardMessage(game.ascii())}`, chatId)

    const botMove = choseRandomMove(game.moves())
    console.log(game.moves())
    console.log('botMove', botMove)
    game.move(botMove)

    await PutItem({
      pk: `${gameId}`,
      sk: `move-${nextMovePos + 1}`,
      gameId,
      move: botMove,
      board: game.fen()
    })

    await sendMessage(`${nextMovePos + 1}. ${botMove}\n${buildBoardMessage(game.ascii())}`, chatId)
  }

  return payload
}