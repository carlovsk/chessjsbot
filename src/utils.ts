import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

export const cleanObject = (object: object) => omitBy(object, isNil)
