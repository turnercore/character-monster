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
  characterIds?: string[]
): Promise<ServerActionReturn<ReturnData>> {
  try {
    const { userId, supabase } = await setupSupabaseServerAction()
    const characters: Character[] = []

    if (characterIds) {
      const validatedIds = inputSchema.parse(characterIds)

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
    } else {
      // Get all characters the user is the owner of
      const { data, error } = await supabase
        .from(CHARACTERS_TABLE)
        .select('*')
        .eq('owner', userId)

      if (data) characters.push(...data)
      // Get all characters user is in the 'users' array of
      const { data: sharedData, error: sharedError } = await supabase
        .from(CHARACTERS_TABLE)
        .select('*')
        .contains('users', [userId])

      // Add non-duplicate characters to the array
      if (sharedData) {
        for (const character of sharedData) {
          if (!characters.find((c) => c.id === character.id)) {
            characters.push(character)
          }
        }
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
