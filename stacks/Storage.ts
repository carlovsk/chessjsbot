import * as sst from '@serverless-stack/resources'

export default class Table extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    this.table = new sst.Table(this, 'table', {
      fields: {
        pk: sst.TableFieldType.STRING,
        sk: sst.TableFieldType.STRING
      },
      primaryIndex: { partitionKey: 'pk', sortKey: 'sk' }
    })
  }
}
