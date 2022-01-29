import { setWebhook } from './services'
import { debug } from './core'
import { getCommandAndText } from './utils'
import { commands } from './commands'
import { Event, Payload } from './types/payload'

export const setHooks = async () => {
  const response = await setWebhook(`${process.env.API_GATEWAY_URL}/telegram`)
  return response
}

export const hooks = async (event: Event): Promise<void | Payload> => {
  const payload: Payload = event.body && JSON.parse(event.body)

  const isCommand = payload.message.text.startsWith('/')
    && payload.message?.entities[0]?.type === 'bot_command'
  debug('lambdas:hooks')('payload %o isCommand %o', payload, isCommand)

  // Checking if request is an slash command
  if (!isCommand) return

  const { command, text } = getCommandAndText(payload.message.text)
  debug('lambdas:hooks')('command %o text %o', command, text)

  if (commands[command]) {
    return await commands[command](payload)
  }

  return payload
}