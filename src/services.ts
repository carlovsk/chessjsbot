import axios from 'axios'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { debug, secrets } from './core'

// /////// //
// AWS SSM //
// /////// //
const secretParameterNameBuilder = (name: string): string => `/env/${process.env.PROJECT_NAME}/${process.env.STAGE}/${name}`

export const getParameter = async (name: string): Promise<string> => {
  const client = new SSMClient({})

  const param = secretParameterNameBuilder(name)
  debug('services:ssm:getParameter')('param %o', param)

  const { Parameter: { Value } } = await client.send(new GetParameterCommand({
    Name: param
  }))
  return Value
}

// //////// //
// TELEGRAM //
// //////// //
const getClient = async () => axios.create({
  baseURL: `https://api.telegram.org/bot${await secrets.telegramAccessToken()}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const sendMessage = async (text: string) => {
  const client = await getClient()
  const { data } = await client.post('sendMessage', {
    chat_id: await secrets.telegramChatId(),
    parse_mode: 'Markdown',
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
