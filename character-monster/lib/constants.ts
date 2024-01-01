// Exported Constants

const projectName = 'character-monster'
//VERY IMPORTANT: Make sure this identifier is unique if you're using shared databases or you will overrwrite your old database
const projectPrefix = 'cm' 

// See if database is shared
const isSharedDb = process.env.SHARED_DB ? process.env.SHARED_DB : false
const hasSharedProfiles = process.env.SHARED_PROFILES
  ? process.env.SHARED_PROFILES
  : true

// Tables in DB (if in a shared db then they will be prefixed automatically)
export const PROFILES_TABLE =
  hasSharedProfiles || !isSharedDb ? 'profiles' : projectPrefix + '_profiles'
export const API_KEY_TABLE = isSharedDb
  ? projectPrefix + '_api_keys'
  : 'api_keys'
