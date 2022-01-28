import { userById } from '../db/queries'
import { saveUser } from '../db/functions'
import { sendMessage } from '../services'

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  await sendMessage('Welcome!\n\nThis is the HarvestJs Bot! It\'s an open source project made with JavaScript.\n\nYou can start a game by running the command `/newgamebot`.\n\nHave fun!', id)

  const user = await userById(id.toString())
  if (!user) await saveUser(payload.message.from)
}