'use server'
import { CharacterSchema, UUIDSchema, type UUID } from '@/lib/schemas'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions for update
type ReturnData = {
  success: boolean
}

// Zod validation of input data for update
const inputSchema = z.object({
  id: UUIDSchema, // Ensure the ID is provided for update
  updates: CharacterSchema.partial(), // Only partial updates needed
})

type InputType = z.infer<typeof inputSchema>

export async function updateCharacterSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input data
    const { id, updates } = inputSchema.parse(input)
    const { userId, supabase } = await setupSupabaseServerAction()
    const { error } = await supabase
      .from(CHARACTERS_TABLE)
      .update(updates)
      .eq('id', id)

    if (error) {
      throw error
    }

    // Return success data
    return {
      data: {
        success: true,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
