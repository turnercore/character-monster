'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import {
  ThirdPartyAPIKey,
  ThirdPartyAPIKeySchema,
  SupportedServicesSchema,
} from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { z } from 'zod'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

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
  try {
    // Get user Id
    const { supabase, userId } = await setupSupabaseServerAction()

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
