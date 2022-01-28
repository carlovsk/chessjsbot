import { debug } from './core'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoDBClient, PutItemCommand, BatchWriteItemCommand, QueryCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({})
const TABLE_NAME = process.env.TABLE_NAME

// ///////////////////////////// //
// Methods related to Ddb itself //
// ///////////////////////////// //
interface DdbItem {
  pk?: string
  sk?: string
  [key: string]: any
}

interface QueryParams {
  pk: string
  sk: string
  attributes?: string[]
}

// Adding ddb services
export const PutItem = async (item: DdbItem) => {
  debug('ddb:PutItem')('pk %o sk %o ', item.pk, item.sk)
  const response = await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(item)
  }))
  return response
}

export const DeleteItem = async ({ pk, sk }: DdbItem) => {
  debug('ddb:DeleteItem')('pk %o sk %o ', pk, sk)
  const response = await client.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ pk, sk })
  }))
  return response
}

export const BatchWriteItems = (items: DdbItem[]) => client.send(new BatchWriteItemCommand({
  RequestItems: {
    [TABLE_NAME]: items.map(item => ({
      PutRequest: {
        Item: marshall(item)
      }
    }))
  }
}))

export const Query = async ({ pk, sk, attributes }: QueryParams): Promise<DdbItem[]> => {
  debug('ddb:Query')('pk %o sk %o attributes %o', pk, sk, attributes)

  const query = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: marshall({ ':pk': pk, ':sk': sk }),
    ProjectionExpression: attributes
      ? attributes.map(attr => `#${attr}`).join(', ')
      : undefined,
    ExpressionAttributeNames: attributes
      ? attributes.reduce((acc, attr) => ({ ...acc, [`#${attr}`]: attr }), {})
      : undefined
  }

  const { Items = [] } = await client.send(new QueryCommand(query))
  debug('ddb:Query')('Items.length %o', Items.length)

  return Items.map(item => unmarshall(item))
}

// ///////////////////////////// //
// Things related to app context //
// ///////////////////////////// //
export const gameStatus = {
  running: 'running',
  finished: 'finished'
}

interface GameKeysParams {
  playerId: string
  gameId?: string
  status?: string
}
export const buildKeys = {
  game: ({ playerId, gameId, status = gameStatus.running }: GameKeysParams) => {
    const keys = {
      pk: 'game',
      sk: `${playerId}-${status}`
    }
    if (gameId) keys.sk += `-${gameId}`
    return keys
  },
  player: (playerId: string, gameId: string) => ({
    pk: gameId,
    sk: `player-${playerId}`
  })
}
