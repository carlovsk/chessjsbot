import middlewares from './middlewares'
import { setWebhook, sendMessage } from './services'
import { debug } from './core'
import { getCommandAndText } from './utils'
import { commands } from './commands'
import { Event, Payload } from './types/payload'

export const setHooks =  middlewares.base(async () => {
  const response = await setWebhook(`${process.env.API_GATEWAY_URL}/telegram`)
  return response
})

export const hooks =  middlewares.base(async (event: Event): Promise<void | Payload> => {
  const payload: Payload = event.body && JSON.parse(event.body)
  debug('lambdas:hooks')('payload %o', payload)

  if (!payload.message) return

  const isCommand = payload.message.text.startsWith('/')
    && payload.message?.entities[0]?.type === 'bot_command'
  debug('lambdas:hooks')('isCommand %o', isCommand)

  // Checking if request is an slash command
  if (!isCommand) return

  const { command, text } = getCommandAndText(payload.message.text)
  debug('lambdas:hooks')('command %o text %o', command, text)

  if (commands[command]) {
    return await commands[command](payload)
  } else {
    const text = 'Sorry, I don\'t know this command. Try running `/help` to see the commands I know.'
    return await sendMessage(text, payload.message.chat.id)
  }
})
