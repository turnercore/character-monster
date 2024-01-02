'use server'
import { type ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { CHARACTERS_TABLE } from '@/lib/constants'
import { UUIDSchema, type Character } from '@/lib/schemas'

// Type definitions for fetched characters
type ReturnData = {
  characters: Character[]
}

// Zod validation of input data
const inputSchema = z.array(UUIDSchema)

export async function fetchCharactersSA(
  characterIds: string[]
): Promise<ServerActionReturn<ReturnData>> {
  try {
    const validatedIds = inputSchema.parse(characterIds)
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)

    let characters: Character[] = []
    for (const id of validatedIds) {
      const { data, error } = await supabase
        .from(CHARACTERS_TABLE)
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        characters.push(data)
      }
    }

    return {
      data: {
        characters,
      },
    }
  } catch (error) {
    // Handle and return errors
    return { error: extractErrorMessage(error) }
  }
}
