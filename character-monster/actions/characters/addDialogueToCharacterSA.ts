// AddDialogueToCharacterSA.ts
'use server'
import { z } from 'zod'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema } from '@/lib/schemas'

const inputSchema = z.object({
  characterId: UUIDSchema,
  playerLine: z.string(),
  npcResponse: z.string(),
})

type InputType = z.infer<typeof inputSchema>

export async function addDialogueToCharacterSA(
  input: InputType
): Promise<ServerActionReturn<{ success: boolean }>> {
  try {
    const { characterId, playerLine, npcResponse } = inputSchema.parse(input)
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    const { data, error } = await supabase
      .from(CHARACTERS_TABLE)
      .select('history')
      .eq('id', characterId)
      .single()

    if (error) throw error

    const updatedHistory = `${data.history}\nPlayer1: '${playerLine}'\nNPC_Name: '${npcResponse}'`
    const { error: updateError } = await supabase
      .from(CHARACTERS_TABLE)
      .update({ history: updatedHistory })
      .eq('id', characterId)

    if (updateError) throw updateError

    return { data: { success: true } }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
