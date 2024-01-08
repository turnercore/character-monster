'use server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// WARNING THIS FUNCTION CAN ERROR IF THE USER IS NOT LOGGED IN

export async function setupSupabaseServerAction() {
  const cookieJar = cookies()
  const headersList = headers()
  const jwt = headersList.get('user-allowed-session')
  console.log('jwt', jwt)
  const supabase = jwt ? createClient(cookieJar, jwt) : createClient(cookieJar)
  const session = await supabase.auth.getSession()
  if (!session.data.session?.user || session.error) {
    throw new Error('User not authenticated')
  }

  const userId = session.data.session.user.id
  console.log('userId', userId)
  if (!userId) throw new Error('User ID not found in session')
  return { supabase, userId }
}
