/* eslint-disable no-new, no-unused-vars, @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'

export default class Api extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    const TelegramHooksFunction = new sst.Function(this, 'TelegramHooks', {
      functionName: `${this.stackName}-telegram-hooks`,
      handler: 'src/lambdas.hooks'
    })

    // API to receive Discord's webhooks
    const api = new sst.Api(this, 'DiscordHooks', {
      routes: {
        'POST /telegram': {
          function: TelegramHooksFunction
        }
      }
    })

    const SetTelegramHooksFunction = new sst.Function(this, 'SetTelegramHooks', {
      functionName: `${this.stackName}-set-telegram-hooks`,
      handler: 'src/lambdas.setHooks',
      environment: { API_GATEWAY_URL: api.url }
    })

    this.addOutputs({
      ApiEndpoint: api.url,
    })
  }
}
