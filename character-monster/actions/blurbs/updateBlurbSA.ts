'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE } from '@/lib/constants'
import { BlurbSchema, UUIDSchema } from '@/lib/schemas'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Zod validation of input data for update
const inputSchema = z.object({
  id: UUIDSchema,
  updates: BlurbSchema.omit({ id: true }).partial(),
})

type InputType = z.infer<typeof inputSchema>

export async function updateBlurbSA(
  input: InputType
): Promise<ServerActionReturn<{ success: boolean }>> {
  try {
    const { id, updates } = inputSchema.parse(input)
    const { userId, supabase } = await setupSupabaseServerAction()

    const { error } = await supabase
      .from(BLURBS_TABLE)
      .update(updates)
      .match({ id })

    if (error) {
      throw error
    }

    return {
      data: {
        success: true,
      },
    }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
