import axios from 'axios'
import { secrets } from './core'

const getClient = async () => axios.create({
  baseURL: `https://api.telegram.org/bot${secrets.telegramAccessToken}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const sendMessage = async (text: string, chatId: string) => {
  const client = await getClient()
  const { data } = await client.post('sendMessage', {
    chat_id: chatId,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    text
  })
  return data
}

export const setWebhook = async (url: string) => {
  const client = await getClient()
  const { data } = await client.post('setWebhook', {
    url
  })
  return data
}
