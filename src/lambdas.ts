import { setWebhook } from './services'
import { debug } from './core'

export const setHooks = async () => {
  const response = await setWebhook(`${process.env.API_GATEWAY_URL}/telegram`)
  return response
}

export const hooks = async event => {
  const payload = event.body && JSON.parse(event.body)
  const isCommand = payload.message.text.startsWith('/')
    && payload.message?.entities[0]?.type === 'bot_command'

  debug('lambdas:hooks')('payload %o isCommand %o', payload, isCommand)

  // Checking if request is an slash command
  if (!isCommand) return

  const [, command] = payload.message.text.split(' ')[0].split('/')
  debug('lambdas:hooks')('command %o', command)

  return payload
}