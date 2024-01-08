'use server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createDecoder } from 'fast-jwt'

// WARNING THIS FUNCTION CAN ERROR IF THE USER IS NOT LOGGED IN

export async function setupSupabaseServerAction() {
  const cookieJar = cookies()
  const headersList = headers()
  const jwt = headersList.get('user-allowed-session')
  const supabase = createClient(cookieJar)
  let userId = ''
  if (jwt) {
    // Decode the jwt with fast-jwt
    const decode = createDecoder()
    const jwtData = decode(jwt)
    userId = jwtData.sub
    supabase.realtime.setAuth(jwt)
    supabase.functions.setAuth(jwt)
    await supabase.auth.setSession({ access_token: jwt, refresh_token: jwt })
  } else {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.user || session.error) {
      throw new Error('User not authenticated, no user found')
    }
    userId = session.data.session.user.id
  }

  if (!userId) throw new Error('User ID not found in session')

  return { supabase, userId }
}
