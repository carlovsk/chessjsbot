import * as sst from '@serverless-stack/resources'
import { buildEnvVarObject } from './helpers/build-env-object'
import { vars } from './helpers/common-envs'
import StorageStack from './Storage'
import LambdaStack from './Lambda'

export default function main (app: sst.App): void {
  const storage = new StorageStack(app, 'storage')

  // Adding default settings to lambdas
  app.setDefaultFunctionProps({
    timeout: 30,
    runtime: 'nodejs14.x',
    bundle: {
      format: 'cjs',
    },
    environment: {
      ...buildEnvVarObject(vars),
      TABLE_NAME: storage.table.tableName,
      DEBUG: `${app.name}:*`,
      PROJECT_NAME: app.name,
      STAGE: app.stage
    }
  })

  // Adding permission for all stacks to access the storage
  app.addDefaultFunctionPermissions([storage.table, 'ssm:GetParameter'])

  new LambdaStack(app, 'lambdas')
}
