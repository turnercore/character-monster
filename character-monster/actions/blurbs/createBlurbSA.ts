'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE } from '@/lib/constants'
import { BlurbSchema, type Blurb, UUIDSchema } from '@/lib/schemas'
import { randomUUID } from 'crypto'

// Zod validation of input data
const inputSchema = z.object({
  blurb: BlurbSchema.omit({ id: true, owner: true }),
  user_id: UUIDSchema,
})

export async function createBlurbSA(
  input: z.infer<typeof inputSchema>
): Promise<ServerActionReturn<{ blurbId: string }>> {
  try {
    const { blurb, user_id } = inputSchema.parse(input)
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    const blurbId = randomUUID()
    const newBlurb: Blurb = {
      ...blurb,
      id: blurbId,
      owner: user_id,
    }
    const { data, error } = await supabase
      .from(BLURBS_TABLE)
      .insert(newBlurb)
      .single()

    if (error || !data) {
      throw error || new Error('Failed to create blurb')
    }

    return {
      data: {
        blurbId,
      },
    }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
