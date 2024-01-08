'use server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// WARNING THIS FUNCTION CAN ERROR IF THE USER IS NOT LOGGED IN

export async function setupSupabaseServerAction() {
  const cookieJar = cookies()
  const headersList = headers()
  const jwt = headersList.get('user-allowed-session')
  const supabase = jwt ? createClient(cookieJar, jwt) : createClient(cookieJar)
  const userId = (await supabase.auth.getSession()).data.session?.user.id
  if (!userId) throw new Error('User ID not found in session')
  return { supabase, userId }
}
