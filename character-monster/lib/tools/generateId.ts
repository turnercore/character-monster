import { UUID } from '@/lib/schemas'
import { randomUUID } from 'crypto'

export default function generateUUID(): UUID {
  return randomUUID()
}
