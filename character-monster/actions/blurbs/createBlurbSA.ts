'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE } from '@/lib/constants'
import { BlurbSchema, type Blurb, UUIDSchema } from '@/lib/schemas'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Zod validation of input data
const inputSchema = z.object({
  blurb: BlurbSchema.partial({ id: true, owner: true }),
  user_id: UUIDSchema,
})

export async function createBlurbSA(
  input: z.infer<typeof inputSchema>
): Promise<ServerActionReturn<{ blurbId: string }>> {
  try {
    const { blurb, user_id } = inputSchema.parse(input)
    const { userId, supabase } = await setupSupabaseServerAction()

    const blurbId = generateRandomUUID()
    const newBlurb: Blurb = {
      ...blurb,
      id: blurb.id || blurbId,
      owner: blurb.owner || user_id,
    }
    const { error } = await supabase.from(BLURBS_TABLE).insert(newBlurb)

    if (error) throw error

    return {
      data: {
        blurbId,
      },
    }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
