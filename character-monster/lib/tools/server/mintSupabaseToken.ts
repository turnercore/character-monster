'use server'
import { createSigner } from 'fast-jwt'

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
    exp,
    sub: userId,
    email: userEmail,
    role: 'authenticated',
  }
  return signer(payload)
}
