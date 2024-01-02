'use server'
import { CharacterSchema, type UUID } from '@/lib/schemas'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { CHARACTERS_TABLE } from '@/lib/constants'

// Type definitions
type ReturnData = {
  characterId: UUID
  success: boolean
}

// Zod validation of input data (adjust as needed)
const inputSchema = z.object({
  // Define your validation schema here
  character: CharacterSchema,
})

type InputType = z.infer<typeof inputSchema>

export async function createCharacterSA(input: InputType): Promise<
  // Define your parameters here
  ServerActionReturn<ReturnData>
> {
  try {
    // Validate input data
    const { character } = inputSchema.parse(input)

    if (!character) {
      throw new Error('No character found')
    }

    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')

    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    if (!character.id) {
      character.id = crypto.randomUUID()
    }

    const { error } = await supabase.from(CHARACTERS_TABLE).insert(character)

    if (error) {
      throw error
    }

    // Return success data
    return {
      data: {
        characterId: character.id,
        success: true,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
