'use server'
import { createClient } from '@/utils/supabase/serviceRole'
import { cookies } from 'next/headers'
import { API_KEYS_TABLE } from '../../constants'
import extractErrorMessage from '../extractErrorMessage'
import { type UUID } from '@/lib/schemas'

// Function can error out
// Function is using service role, please be careful when using

const apiKeysTable = API_KEYS_TABLE || 'api_keys' // Adjust as per your table name

export async function getTokenFromUserId(userId: UUID) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from(apiKeysTable)
    .select('token')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.log('error', error)
    throw new Error(
      extractErrorMessage(error, 'Unknown error from validateApiKey.')
    )
  }

  if (!data) {
    return ''
  } else {
    return data.token
  }
}
