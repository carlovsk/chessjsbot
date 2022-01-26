import d from 'debug'
import { getParameter } from './services'

export const debug = (path: string) => d(`${process.env.PROJECT_NAME}:${path}`)

export const secrets = {
  telegramAccessToken: () => getParameter('TELEGRAM_ACCESS_TOKEN'),
  telegramChatId: () => getParameter('TELEGRAM_CHAT_ID')
}
