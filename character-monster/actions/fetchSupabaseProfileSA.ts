'use server'
import type { Profile, ServerActionReturn } from '@/lib/schemas'
import { cookies } from 'next/headers'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { generateUsername } from '@/lib/tools/nameGenerators'
import { createClient } from '@/utils/supabase/server'

const fetchSupabaseProfileSA = async (
  userId: string
): Promise<ServerActionReturn<Profile>> => {
  const supabase = createClient(cookies())
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)

    if (profileError) throw profileError

    // If there is no profile data, then create a new profile
    if (
      !profileData ||
      profileData.length === 0 ||
      profileData[0] === undefined
    ) {
      createNewProfile(userId)
    }

    return { data: profileData[0] as Profile }
  } catch (error) {
    return {
      error: extractErrorMessage(
        error,
        'Unknown error from fetchSupabaseProfileSA.'
      ),
    }
  }
}

const createNewProfile = async (newProfileId: string) => {
  const supabase = createClient(cookies())

  const newProfile = {
    id: newProfileId,
    username: generateUsername(),
    color: '#FFFFFF',
    avatar_set: 1,
    reduce_motion: false,
  }

  const { error } = await supabase.from('profiles').upsert(newProfile)

  if (error) throw error
}

export default fetchSupabaseProfileSA
