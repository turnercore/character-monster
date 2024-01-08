'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { ThirdPartyAPIKey, type SupportedServices } from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

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
    const { userId, supabase } = await setupSupabaseServerAction()

    const { data: ApiKeyData, error: APIKeyFetchError } = await supabase
      .from(third_party_keys)
      .select('*')
      .eq('owner', userId)
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
