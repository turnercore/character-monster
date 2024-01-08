'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions for the response
type ReturnData = {
  success: boolean
}

// Zod validation of input data
const inputSchema = z.object({
  id: z.string(), // Character ID is required
})

type InputType = z.infer<typeof inputSchema>

export async function deleteCharacterSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input data
    const { id } = inputSchema.parse(input)
    const { userId, supabase } = await setupSupabaseServerAction()

    const { error } = await supabase
      .from(CHARACTERS_TABLE)
      .update({ archived: true })
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
