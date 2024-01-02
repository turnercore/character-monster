'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE } from '@/lib/constants'
import { BlurbSchema, type Blurb, UUIDSchema } from '@/lib/schemas'
import { randomUUID } from 'crypto'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'

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
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

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
