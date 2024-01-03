// Server Side Rendered Page
import ServerToastMessage from '@/components/ServerToastMessage'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUID } from '@/lib/schemas'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import CharacterEditor from './components/CharacterEditor'
import ChatTestingArea from './components/ChatTestingArea'

// Define expected params and search params
type PageParams = {
  id: UUID
}
type SearchParams = {}

//Page
const CharacterPage = async ({
  params,
  searchParams,
}: {
  params: PageParams
  searchParams: SearchParams
}) => {
  // Get id from params
  const { id } = params

  // Get userId from supabase
  const supabase = createClient(cookies())
  const { data, error } = await supabase.auth.getSession()
  const userId = data.session?.user.id as UUID

  // Redirect to login if not logged in
  if (error || !userId) {
    return (
      <ServerToastMessage
        message="Not logged in"
        type="error"
        redirect="/account/login"
      />
    )
  }

  // Grab initial character data from supabase
  const { data: characterData, error: characterError } = await supabase
    .from(CHARACTERS_TABLE)
    .select('*')
    .eq('id', id)
    .single()

  // Ensure character exists
  if (characterError || !characterData) {
    return (
      <ServerToastMessage
        message={extractErrorMessage(characterError, 'Character not found')}
        type="error"
        redirect="/character/create"
      />
    )
  }

  // Ensure user has access to character (this should have already been done with RLS)
  if (characterData.owner !== userId && !characterData.users.includes(userId)) {
    return (
      <ServerToastMessage
        message="You do not have access to this character"
        type="error"
        redirect="/character/create"
      />
    )
  }

  // Ensure character is not archived
  if (characterData.archived) {
    return (
      <ServerToastMessage
        message="Character is archived"
        type="error"
        redirect="/character/create"
      />
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2">
        <CharacterEditor characterData={characterData} userId={userId} />
      </div>
      <div className="w-1/2">
        <ChatTestingArea userId={userId} character={characterData} />
      </div>
    </div>
  )
}

export default CharacterPage
