import axios from 'axios'
import { debug, secrets } from './core'

const client = axios.create({
  baseURL: `https://api.telegram.org/bot${secrets.telegramAccessToken}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const sendMessage = async (text: string, chatId: string) => {
  const { data } = await client.post('sendMessage', {
    chat_id: chatId,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    text
  })
  debug('services:telegram:sendMessage')('message sent')
  return data
}

export const setWebhook = async (url: string) => {
  const { data } = await client.post('setWebhook', {
    url
  })
  debug('services:telegram:setWebhook')('webhook set')
  return data
}
