'use server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const signOutSA = async () => {
  const supabase = createClient(cookies())
  const { error } = await supabase.auth.signOut()
  if (error) return { error }
  return {
    data: {
      success: true,
    },
  }
}
