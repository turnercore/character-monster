'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { ThirdPartyAPIKey } from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'

// Type definitions
type ReturnData = {
  apiKey: string
}

const third_party_keys = THIRD_PARTY_KEYS_TABLE

export async function fetchElevenLabsApiKeySA(): Promise<
  ServerActionReturn<ReturnData>
> {
  try {
    if (!third_party_keys) throw new Error('Third party keys table not set')

    const supabase = createClient(cookies())
    const user_id = (await supabase.auth.getSession()).data.session?.user.id
    if (!user_id) throw new Error('User ID not found in session')
    console.log('user_id', user_id)

    const { data: ApiKeyData, error: APIKeyFetchError } = await supabase
      .from(third_party_keys)
      .select('*')
      .eq('owner', user_id)

    if (APIKeyFetchError || !ApiKeyData || ApiKeyData.length === 0)
      throw new Error('Failed to retrieve API key from Supabase')

    const ApiKeys = ApiKeyData as ThirdPartyAPIKey[]
    const elevenLabsKey = ApiKeys.find((key) => key.type === 'elevenlabs')
    if (!elevenLabsKey) throw new Error('No elevenlabs API key found')

    return { data: { apiKey: elevenLabsKey.api_key } }
  } catch (error) {
    return {
      error: extractErrorMessage(
        error,
        'Unknown error in fetchElevenLabsApiKeySA'
      ),
    }
  }
}
