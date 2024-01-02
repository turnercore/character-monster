'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { ThirdPartyAPIKey, ThirdPartyAPIKeySchema } from '@/lib/schemas'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { cookies } from 'next/headers'

type ReturnType = {
  success: boolean
}

const upsertElevenLabsApiKeySA = async (
  apiKey: string
): Promise<ServerActionReturn<ReturnType>> => {
  const supabase = createClient(cookies())
  try {
    // Get userID from session
    const userId = (await supabase.auth.getSession()).data.session?.user.id
    if (!userId) throw new Error('User ID not found in session')

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
