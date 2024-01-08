'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { setupSupabaseServerAction } from '@/lib/tools/server/setupSupabaseServerAction'
import { getTokenFromUserId } from '@/lib/tools/server/getTokenFromUserId'

// Type definitions
type ReturnData = {
  token: string
}

export async function getMonsterTokenSA(): Promise<
  ServerActionReturn<ReturnData>
> {
  try {
    // Get OpenAI API key from database
    const { userId } = await setupSupabaseServerAction()

    // Get the monster token from the database if it exists
    const token = await getTokenFromUserId(userId)

    // If the token exists, return it
    return { data: { token: token || '' } }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
