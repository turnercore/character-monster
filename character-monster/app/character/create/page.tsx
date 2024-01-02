import { createClient } from '@/utils/supabase/server'
import CreateCharacterForm from './components/createCharacterForm'
import { cookies } from 'next/headers'

const CreateCharacterPage = async () => {
  const supabase = createClient(cookies())
  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session?.user.id) {
    return <div>Not logged in</div>
  }

  const userId = data.session.user.id

  return (
    <div className=" min-h-screen">
      <CreateCharacterForm userId={userId} />
    </div>
  )
}

export default CreateCharacterPage
