'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { BLURBS_TABLE, CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema } from '@/lib/schemas'

export async function deleteBlurbSA(
  blurbId: string
): Promise<ServerActionReturn<{ success: boolean }>> {
  try {
    UUIDSchema.parse(blurbId) // Validate UUID
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    const { error } = await supabase
      .from(BLURBS_TABLE)
      .delete()
      .match({ id: blurbId })

    if (error) {
      throw error
    }

    // Clean up unused blurbs from the database, this deletes them from the characters table as well
    supabase.rpc('delete_blurb', { blurb_id: blurbId, table: CHARACTERS_TABLE })

    return {
      data: {
        success: true,
      },
    }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
