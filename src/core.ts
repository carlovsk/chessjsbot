import d from 'debug'

export const debug = (path: string) => d(`${process.env.PROJECT_NAME}:${path}`)

export const secrets = {
  telegramAccessToken: process.env.TELEGRAM_ACCESS_TOKEN
}
