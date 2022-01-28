import { PutItem } from "../ddb"
import { sendMessage } from "../services"

export default async (payload): Promise<void> => {
  const { id } = payload.message.chat
  await sendMessage('Welcome!\n\nThis is the HarvestJs Bot! It\'s an open source project made with JavaScript.\n\nYou can start a game by running the command `/newgamebot`.\n\nHave fun!', id)

  await PutItem({
    pk: 'user',
    sk: `${id}`,
    ...payload.message.from
  })
}