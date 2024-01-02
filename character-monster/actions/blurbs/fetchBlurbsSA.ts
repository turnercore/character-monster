'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE } from '@/lib/constants'
import { UUIDSchema, type Blurb, UUID } from '@/lib/schemas'

// Type definitions for fetched blurbs
type ReturnData = {
  blurbs: Blurb[]
}

const inputSchema = z.object({
  userId: UUIDSchema,
  blurbIds: z.array(UUIDSchema).optional(),
})

type InputType = z.infer<typeof inputSchema>

const fetchByIdsSchema = z.array(UUIDSchema)

export async function fetchBlurbsSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    //validate input
    const { userId, blurbIds } = inputSchema.parse(input)

    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    let blurbs: Blurb[] = []

    if (blurbIds && blurbIds.length > 0) {
      const validatedIds = fetchByIdsSchema.parse(blurbIds)
      for (const id of validatedIds) {
        const { data, error } = await supabase
          .from(BLURBS_TABLE)
          .select('*')
          .eq('id', id)
          .single()

        if (data) {
          blurbs.push(data)
        }
      }
    } else {
      // Fetch all blurbs for the given user ID
      const { data, error } = await supabase
        .from(BLURBS_TABLE)
        .select('*')
        .eq('owner', userId)

      if (error) {
        throw error
      }

      blurbs = data || []
    }

    return {
      data: {
        blurbs,
      },
    }
  } catch (error) {
    // Handle and return errors
    console.error(error)
    return {
      error: extractErrorMessage(
        error,
        'Error fetching blurbs, no error message.'
      ),
    }
  }
}
