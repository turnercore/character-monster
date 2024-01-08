'use server'
import { CharacterSchema, type UUID } from '@/lib/schemas'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions
type ReturnData = {
  characterId: UUID
}

// Zod validation of input data (adjust as needed)
const inputSchema = z.object({
  // Define your validation schema here
  character: CharacterSchema,
})

type InputType = z.infer<typeof inputSchema>

export async function createCharacterSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input data
    const { character } = inputSchema.parse(input)

    if (!character) {
      throw new Error('No character found')
    }
    const { userId, supabase } = await setupSupabaseServerAction()

    if (!character.id) {
      character.id = generateRandomUUID()
    }

    const { error } = await supabase.from(CHARACTERS_TABLE).insert(character)

    if (error) {
      throw error
    }

    // Return success data
    return {
      data: {
        characterId: character.id,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
