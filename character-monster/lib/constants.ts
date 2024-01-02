// Exported Constants

const projectName = 'character-monster'
//VERY IMPORTANT: Make sure this identifier is unique if you're using shared databases or you will overrwrite your old database
const projectPrefix = 'cm'

// See if database is shared
const isSharedDb = process.env.NEXT_PUBLIC_SHARED_DB
  ? process.env.NEXT_PUBLIC_SHARED_DB
  : false
const hasSharedProfiles = process.env.NEXT_PUBLIC_SHARED_PROFILES
  ? process.env.NEXT_PUBLIC_SHARED_PROFILES
  : true

// Tables in DB (if in a shared db then they will be prefixed automatically)
export const PROFILES_TABLE =
  hasSharedProfiles || !isSharedDb ? 'profiles' : projectPrefix + '_profiles'

export const API_KEYS_TABLE = isSharedDb
  ? projectPrefix + '_api_keys'
  : 'api_keys'

export const BLURBS_TABLE = isSharedDb ? projectPrefix + '_blurbs' : 'blurbs'

export const CHARACTERS_TABLE = isSharedDb
  ? projectPrefix + '_characters'
  : 'characters'

export const THIRD_PARTY_KEYS_TABLE = isSharedDb
  ? projectPrefix + '_third_party_keys'
  : 'third_party_keys'
