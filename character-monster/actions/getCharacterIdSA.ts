'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUID } from '@/lib/schemas'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions
type ReturnData = {
  characterId: UUID
}

// Zod validation of input data (adjust as needed)
const inputSchema = z.string()

export async function getCharacterIdSA(
  character: string
): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input
    const characterName = inputSchema.parse(character)

    // Supabase Setup
    const { userId, supabase } = await setupSupabaseServerAction()

    // Find character Id that user has access to
    const { data: characterData, error: characterError } = await supabase
      .from(CHARACTERS_TABLE)
      .select('id')
      .eq('name', characterName)
      .or(`owner.eq.${userId},users.contains.${userId}`)

    if (characterError || !characterData || characterData.length === 0)
      throw new Error(
        characterError?.message ||
          'Failed to retrieve character data from Supabase'
      )

    // Return success data
    return {
      data: {
        characterId: characterData[0].id,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
