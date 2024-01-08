'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'
import { API_KEYS_TABLE } from '@/lib/constants'
import { mintSupabaseToken } from '@/lib/tools/server/mintSupabaseToken'
import { UUID } from '@/lib/schemas'
import { generateMonsterToken } from '@/lib/tools/generateMonsterToken'

// Type definitions
type ReturnData = {
  token: UUID
}

export async function createMonsterTokenSA(): Promise<
  ServerActionReturn<ReturnData>
> {
  try {
    const { userId, supabase } = await setupSupabaseServerAction()
    const userEmail =
      (await supabase.auth.getSession()).data.session?.user.email || ''

    const newMonsterToken = generateMonsterToken()
    // Create the API key
    const monsterTokenRecord = {
      user_id: userId,
      token: newMonsterToken,
      jwt: mintSupabaseToken(userEmail, userId),
    }

    // Upsert new record
    const { error: updateError } = await supabase
      .from(API_KEYS_TABLE)
      .upsert(monsterTokenRecord)
      .eq('user_id', userId)

    // If update error then try insert
    if (updateError) {
      console.error('Error updating monster token', updateError)
      throw new Error(
        extractErrorMessage(
          updateError,
          'Unknown error from createMonsterTokenSA.'
        )
      )
    }

    // Return success data
    return {
      data: {
        token: newMonsterToken,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
