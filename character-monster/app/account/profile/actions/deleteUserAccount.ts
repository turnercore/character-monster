'use server'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { type ServerActionReturn, UUIDSchema } from '@/lib/schemas'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceRoleClient } from '@/utils/supabase/serviceRole'
import { z } from 'zod'
import { cookies } from 'next/headers'

const inputSchema = z.object({
  userId: UUIDSchema,
})

type ReturnType = {
  success: boolean
}

export default async function deleteUserAccount(
  formData: FormData
): Promise<ServerActionReturn<ReturnType>> {
  try {
    // Get the form data into a javascript object
    const form = Object.fromEntries(formData.entries())

    // Validate data
    const result = inputSchema.safeParse(form)
    if (!result.success) {
      return {
        error: extractErrorMessage(result.error),
        data: { success: false },
      }
    }
    const { userId } = result.data

    // Delete the user from auth
    const supabaseAdmin = createServiceRoleClient(cookies())
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId, false)

    // Sign the user out
    const supabase = createClient(cookies())
    const { error: signOutError } = await supabase.auth.signOut()

    // Clean up the user's data if needed (Delete cascade will take care of this, I believe)

    // Return success
    return { data: { success: true } }
  } catch (error) {
    return { error: extractErrorMessage(error), data: { success: false } }
  }
}
