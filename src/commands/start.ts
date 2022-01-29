import { userById } from '../db/queries'
import { saveUser } from '../db/functions'
import { sendMessage } from '../services'
import { Payload } from '../types/payload'

const message = `
Welcome!

I am the *ChessJs Bot*! An open-source bot built with JavaScript and deployed on AWS. If you want to know more about it, type \`/readme\`.

You can start a new game against me by running the command \`/newgamebot\`.
You can also see the whole list of commands by running the command \`/help\`.

Have fun!
`

export default async (payload: Payload): Promise<void> => {
  const { id } = payload.message.chat
  await sendMessage(message, id)

  const user = await userById(id.toString())
  if (!user) await saveUser(payload.message.from)
}