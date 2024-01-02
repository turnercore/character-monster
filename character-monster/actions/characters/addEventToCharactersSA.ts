'use server'
import { z } from 'zod'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema } from '@/lib/schemas'

// Type definitions
type ReturnData = {
  success: boolean
}

// Zod validation of input data
const inputSchema = z.object({
  characterIds: z.array(UUIDSchema),
  event: z.string(),
})

type InputType = z.infer<typeof inputSchema>

export async function addEventToCharactersSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input data
    const { characterIds, event } = inputSchema.parse(input)
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    await Promise.all(
      characterIds.map(async (id) => {
        const { data, error } = await supabase
          .from(CHARACTERS_TABLE)
          .select('history')
          .eq('id', id)
          .single()

        if (error) throw error

        const updatedHistory = `${data.history}\nEVENT: ${event}`
        const { error: updateError } = await supabase
          .from(CHARACTERS_TABLE)
          .update({ history: updatedHistory })
          .eq('id', id)

        if (updateError) throw updateError
      })
    )

    return { data: { success: true } }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
