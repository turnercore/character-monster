import { v4 as uuidv4 } from 'uuid'
import { UUID } from '../schemas'

export const generateRandomUUID = (): UUID => {
  return uuidv4() as UUID
}
