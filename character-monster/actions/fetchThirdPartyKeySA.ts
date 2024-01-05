'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { ThirdPartyAPIKey, type SupportedServices } from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'

// Type definitions
type ReturnData = {
  apiKey: string
}

const third_party_keys = THIRD_PARTY_KEYS_TABLE

// Fetch a third-party API key based on the service type
export async function fetchThirdPartyKeySA(
  service: SupportedServices
): Promise<ServerActionReturn<ReturnData>> {
  try {
    if (!third_party_keys) throw new Error('Third party keys table not set')
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)
    const user_id = (await supabase.auth.getSession()).data.session?.user.id
    if (!user_id) throw new Error('User ID not found in session')

    const { data: ApiKeyData, error: APIKeyFetchError } = await supabase
      .from(third_party_keys)
      .select('*')
      .eq('owner', user_id)
      .eq('type', service) // Use the 'service' parameter to filter

    if (APIKeyFetchError || !ApiKeyData || ApiKeyData.length === 0)
      throw new Error(`Failed to retrieve ${service} API key from Supabase`)

    const apiKey = ApiKeyData.find((key) => key.type === service)
    if (!apiKey) throw new Error(`No ${service} API key found`)

    return { data: { apiKey: apiKey.api_key } }
  } catch (error) {
    return {
      error: extractErrorMessage(
        error,
        `Unknown error in fetchThirdPartyKeySA for ${service}`
      ),
    }
  }
}
