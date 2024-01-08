'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema, type Character } from '@/lib/schemas'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions for fetched characters
type ReturnData = {
  characters: Character[]
}

// Zod validation of input data
const inputSchema = z.array(UUIDSchema)

export async function fetchCharactersSA(
  characterIds: string[]
): Promise<ServerActionReturn<ReturnData>> {
  try {
    const validatedIds = inputSchema.parse(characterIds)
    const { userId, supabase } = await setupSupabaseServerAction()

    let characters: Character[] = []
    for (const id of validatedIds) {
      const { data, error } = await supabase
        .from(CHARACTERS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        characters.push(data)
      }
    }

    return {
      data: {
        characters,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
