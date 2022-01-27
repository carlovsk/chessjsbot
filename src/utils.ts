import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

export const cleanObject = (object: object) => omitBy(object, isNil)

export const makeId = (length = 6) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
