'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { BLURBS_TABLE } from '@/lib/constants'
import { UUIDSchema, type Blurb, UUID } from '@/lib/schemas'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'

// Type definitions for fetched blurbs
type ReturnData = {
  blurbs: Blurb[]
}

const inputSchema = z.object({
  blurbIds: z.array(UUIDSchema).optional(),
})

type InputType = z.infer<typeof inputSchema>

const fetchByIdsSchema = z.array(UUIDSchema)

export async function fetchBlurbsSA(
  input: InputType
): Promise<ServerActionReturn<ReturnData>> {
  try {
    //validate input
    const { blurbIds } = inputSchema.parse(input)

    const { userId, supabase } = await setupSupabaseServerAction()

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
