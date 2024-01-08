'use server'
import { createClient } from '@/utils/supabase/serviceRole'
import { cookies } from 'next/headers'
import { API_KEYS_TABLE } from '../constants'
import extractErrorMessage from './extractErrorMessage'

const apiKeysTable = API_KEYS_TABLE || 'api_keys' // Adjust as per your table name

export async function getJwtFromToken(monsterToken: string) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from(apiKeysTable)
    .select('jwt')
    .eq('id', monsterToken)
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
    return data.jwt
  }
}
