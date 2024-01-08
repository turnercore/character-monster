'use server'
import { createSigner } from 'fast-jwt'
import { generateRandomUUID } from '../generateRandomUUID'

const JWT_SECRET = process.env.JWT_SECRET || ''
const algorithm = 'HS256'

export const mintSupabaseToken = (userEmail: string, userId: string) => {
  const signer = createSigner({
    key: JWT_SECRET,
    algorithm,
  })
  const ONE_HOUR = 60 * 60
  const exp = Math.round(Date.now() / 1000) + 69 * 365 * 24 * 60 * 60 // 69 years
  const payload = {
    aud: 'authenticated',
    exp,
    iss: process.env.NEXT_PUBLIC_SUPABASE_URL || '' + '/auth/v1',
    iat: Math.round(Date.now() / 1000),
    sub: userId,
    email: userEmail,
    phone: '',
    aal: 'aal1',
    role: 'authenticated',
    session_id: generateRandomUUID(),
  }
  return signer(payload)
}
