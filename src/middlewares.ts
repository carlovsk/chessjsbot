import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { debug } from './core'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: process.env.PROJECT_NAME
})

const base = (handler: any) => middy(handler)
  .use({
    before: async handler => {
      debug('middlewares:base')('Request started')
      logger.addContext(handler.context)
      logger.info('Request started')
    },
    after: async () => {
      debug('middlewares:base')('Request finished')
    }
  })

export default { base }