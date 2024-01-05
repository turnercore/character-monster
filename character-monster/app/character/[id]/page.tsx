// Server Side Rendered Page
import ServerToastMessage from '@/components/ServerToastMessage'
import { CHARACTERS_TABLE, THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { ThirdPartyAPIKeySchema, UUID } from '@/lib/schemas'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import CharacterEditor from '@/components/CharacterEditor'
import ChatTestingArea from './components/ChatTestingArea'
import { ThirdPartyApiKeyUpdateField } from '@/components/ThirdPartyApiKeyUpdateField'

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

  // Check for a saved openai key
  const { count: rowCount, error: userError } = await supabase
    .from(THIRD_PARTY_KEYS_TABLE)
    .select('*', { count: 'exact', head: true })
    .match({ owner: userId, type: 'open_ai' })

  // if one exists, set hasOpenAiKey to true
  const hasOpenAiKey = !userError && rowCount && rowCount > 0 ? true : false

  return (
    <div className="flex min-h-full pb-[250px]">
      <div className="w-1/2">
        <CharacterEditor
          varient="edit"
          characterData={characterData}
          userId={userId}
        />
      </div>
      <div className="w-1/2">
        {hasOpenAiKey ? (
          <ChatTestingArea userId={userId} character={characterData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold">OpenAI API Key Required</h1>
            <p className="text-lg text-center">
              You need to add an OpenAI API key to your account to use this
              feature.
            </p>
            <ThirdPartyApiKeyUpdateField service="open_ai" userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterPage
