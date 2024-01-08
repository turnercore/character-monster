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
