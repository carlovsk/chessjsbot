import { sendMessage } from '../services'

const message = `
Hey!

This is the list of available commands:

  \`/help\` - show this message
  \`/readme\` - show information about the bot
  \`/newgamebot\` - start a new game against the bot
  \`/move\` - make a move on a running game
  \`/availablemoves\` - list the available moves on a running game
`

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  await sendMessage(message, id)
}
