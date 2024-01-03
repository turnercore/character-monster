// @/actions/getAvailableModelsSA.ts
'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import OpenAI from 'openai'

const openai = new OpenAI()

export async function getAvailableModelsSA(): Promise<
  ServerActionReturn<{ models: string[] }>
> {
  try {
    // Get OpenAI API key from database
    // const cookieJar = cookies()
    // const headersList = headers()
    // const jwt = headersList.get('user-allowed-session')
    // const supabase = jwt
    //   ? createClient(cookieJar, jwt)
    //   : createClient(cookieJar)
    // const user_id = (await supabase.auth.getSession()).data.session?.user.id
    // if (!user_id) throw new Error('User ID not found in session')

    // const { data: apiKeyData, error: apiKeyFetchError } = await supabase
    //   .from(THIRD_PARTY_KEYS_TABLE)
    //   .select('*')
    //   .match({ owner: user_id, type: 'open_ai' })

    // if (apiKeyFetchError || !apiKeyData || apiKeyData.length === 0)
    //   throw new Error('Failed to retrieve API key from Supabase')

    // const apiKey = apiKeyData[0].api_key

    // Fetch available models
    const models = await openai.models.list()

    // Return success data
    return {
      data: {
        models: models.data.map((model) => model.id), // Extract model names
      },
    }
  } catch (error) {
    // Handle and return errors
    return {
      error: extractErrorMessage(
        error,
        'Error fetching available models in the Server Action'
      ),
    }
  }
}
