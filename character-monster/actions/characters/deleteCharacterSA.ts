'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { CHARACTERS_TABLE } from '@/lib/constants'

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
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

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
