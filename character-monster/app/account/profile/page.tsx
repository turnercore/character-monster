import UpdateAccountForm from './components/UpdateAccountForm'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { type Profile, ProfileSchema } from '@/lib/schemas'

export default async function AccountPage() {
  let profile: Profile | null = null
  let isAnError = false
  let email = ''

  // Get the user profile data
  const supabase = createClient(cookies())
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('No user ID found in session data')
    email = sessionData.session?.user?.email || ''

    const { data: userProfileData, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (fetchProfileError) throw fetchProfileError
    profile = ProfileSchema.parse(userProfileData)
    if (!profile) throw new Error('No profile data found')
  } catch (error) {
    console.error(error)
    isAnError = true
  }

  return (
    <div className="min-h-screen mb-[250px]">
      {!isAnError && profile && (
        <UpdateAccountForm profile={profile} email={email} />
      )}
    </div>
  )
}
