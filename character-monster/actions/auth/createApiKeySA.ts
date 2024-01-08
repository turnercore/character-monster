// createApiKeySA.ts
'use server'
import type { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { mintSupabaseToken } from '@/lib/tools/server/mintSupabaseToken'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { type UUID } from '@/lib/schemas'

const API_KEYS_TABLE = 'api_keys' // Adjust to your table name

export async function createApiKeySA(): Promise<
  ServerActionReturn<{ apiKey: UUID }>
> {
  const supabase = createClient(cookies())

  try {
    const session = await supabase.auth.getSession()

    if (!session.data.session?.user || session.error) {
      throw new Error('User not authenticated!')
    }

    if (!session.data.session.user.email || !session.data.session.user.id) {
      throw new Error('User email or id not found')
    }

    const jwt = mintSupabaseToken(
      session.data.session.user.email,
      session.data.session.user.id
    )
    const jwtId = generateRandomUUID() as UUID

    // Store the hashed JWT and salt in Supabase
    const { error } = await supabase.from(API_KEYS_TABLE).insert({
      id: jwtId,
      user_id: session.data.session.user.id,
      jwt,
    })

    if (error) {
      throw error
    }

    return { data: { apiKey: jwtId } }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
