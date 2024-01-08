// AddDialogueToCharacterSA.ts
'use server'
import { z } from 'zod'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema } from '@/lib/schemas'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

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
    const { userId, supabase } = await setupSupabaseServerAction()

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
