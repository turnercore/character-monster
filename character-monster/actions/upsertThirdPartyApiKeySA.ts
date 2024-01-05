'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import {
  ThirdPartyAPIKey,
  ThirdPartyAPIKeySchema,
  SupportedServicesSchema,
} from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { cookies, headers } from 'next/headers'
import { z } from 'zod'

type ReturnType = {
  success: boolean
}

const inputSchema = z.object({
  apiKey: z.string(),
  service: SupportedServicesSchema,
})

type InputType = z.infer<typeof inputSchema>

export const upsertThirdPartyApiKeySA = async ({
  apiKey,
  service,
}: InputType): Promise<ServerActionReturn<ReturnType>> => {
  const cookieJar = cookies()
  const headersList = headers()
  const jwt = headersList.get('user-allowed-session')
  const supabase = jwt ? createClient(cookieJar, jwt) : createClient(cookieJar)
  try {
    // Get user Id
    const userId = (await supabase.auth.getSession()).data.session?.user.id
    if (!userId) throw new Error('User ID not found in session')

    const newAPIKey: ThirdPartyAPIKey = ThirdPartyAPIKeySchema.parse({
      api_key: apiKey,
      owner: userId,
      type: service, // Use the service parameter here
      endpoint: null, // This can be modified or removed as per requirements
    })

    // Delete any existing api keys with the provided service type
    const { error: deleteError } = await supabase
      .from(THIRD_PARTY_KEYS_TABLE)
      .delete()
      .eq('owner', userId)
      .eq('type', service)

    const { error } = await supabase
      .from(THIRD_PARTY_KEYS_TABLE)
      .upsert(newAPIKey)

    if (error) {
      console.log('error', error)
      throw error
    }

    return { data: { success: true } }
  } catch (error) {
    return {
      error: extractErrorMessage(
        error,
        `Unknown error from upsert${
          service.charAt(0).toUpperCase() + service.slice(1)
        }ApiKeySA.`
      ),
    }
  }
}
