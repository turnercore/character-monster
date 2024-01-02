'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import {
  ThirdPartyAPIKey,
  ThirdPartyAPIKeySchema,
  UUIDSchema,
} from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { cookies, headers } from 'next/headers'
import { z } from 'zod'

type ReturnType = {
  success: boolean
}

const inputSchema = z.object({
  apiKey: z.string(),
  userId: UUIDSchema,
})

type InputType = z.infer<typeof inputSchema>

const upsertElevenLabsApiKeySA = async ({
  apiKey,
  userId,
}: InputType): Promise<ServerActionReturn<ReturnType>> => {
  const cookieJar = cookies()
  const headersList = headers()
  const jwt = headersList.get('user-allowed-session')
  const supabase = jwt ? createClient(cookieJar, jwt) : createClient(cookieJar)
  try {
    const newAPIKey: ThirdPartyAPIKey = ThirdPartyAPIKeySchema.parse({
      api_key: apiKey,
      owner: userId,
      type: 'elevenlabs',
      endpoint: null,
    })

    // Delete any exisiting api keys with elevenlabs type
    const { error: deleteError } = await supabase
      .from(THIRD_PARTY_KEYS_TABLE)
      .delete()
      .eq('owner', userId)
      .eq('type', 'elevenlabs')

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
        'Unknown error from upsertElevenLabsApiKeySA.'
      ),
    }
  }
}

export default upsertElevenLabsApiKeySA
