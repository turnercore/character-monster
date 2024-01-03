// @/actions/getNpcResponseSA.ts
'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { fetchCharactersSA } from '@/actions/characters/fetchCharactersSA'
import OpenAI from 'openai'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { THIRD_PARTY_KEYS_TABLE } from '@/lib/constants'
import { Models } from 'openai/resources'
import { fetchBlurbsSA } from './blurbs/fetchBlurbsSA'

const openai = new OpenAI()

// Zod validation of input data
const inputSchema = z.object({
  characterId: z.string(),
  message: z.string(),
  model: z.string().optional(),
  system: z.string().optional(),
})

type inputType = z.infer<typeof inputSchema>

export async function getNpcResponseSA(
  input: inputType
): Promise<ServerActionReturn<{ response: string }>> {
  try {
    // Validate input
    const { characterId, message, model, system } = inputSchema.parse(input)

    console.log('system', system)

    // Get OpenAI API key from database
    const cookieJar = cookies()
    const headersList = headers()
    const jwt = headersList.get('user-allowed-session')
    const supabase = jwt
      ? createClient(cookieJar, jwt)
      : createClient(cookieJar)
    const user_id = (await supabase.auth.getSession()).data.session?.user.id
    if (!user_id) throw new Error('User ID not found in session')

    const { data: ApiKeyData, error: APIKeyFetchError } = await supabase
      .from(THIRD_PARTY_KEYS_TABLE)
      .select('*')
      .match({ owner: user_id, type: 'open_ai' })

    if (APIKeyFetchError || !ApiKeyData || ApiKeyData.length === 0)
      throw new Error('Failed to retrieve API key from Supabase')

    const ApiKeys = ApiKeyData as { api_key: string }[]
    const openaiKey = ApiKeys[0].api_key

    // Fetch character data
    const { data: characterData, error: characterError } =
      await fetchCharactersSA([characterId])
    if (
      characterError ||
      !characterData ||
      characterData.characters.length === 0
    ) {
      throw new Error(characterError || 'Character not found')
    }

    const character = characterData.characters[0]

    // Construct the knowledgebase for the character from blurb ids
    const { data: blurbData, error: blurbError } = await fetchBlurbsSA({
      userId: user_id,
      blurbIds: character.knowledge || [],
    })

    if (blurbError) {
      console.error(extractErrorMessage(blurbError, 'Error fetching blurbs'))
    }

    const blurbs = blurbData?.blurbs || []

    const systemMessage = `${system} + 'Use the following context for your character: 
      Your name is ${character.name}.
      You are described as ${character.description}.
      Your identity is ${character.identity}.
      The recent history and conversations involving your character are as follows:
      ${character.history}

      Your character has the following knowledgebase:
      ${blurbs
        .map((blurb) => `${blurb.name || ''}: ${blurb.content || ''}`)
        .join('\n')}'
      `

    console.log('systemMessage', systemMessage)

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            systemMessage ||
            `You are an NPC named ${character.name} in a tabletop roleplaying game. Anwser and engage the player, but never break character. Always answer in character.`,
        },
        { role: 'user', content: message },
      ],
      model: model || 'gpt-3.5-turbo',
    })

    if (
      chatCompletion.choices.length <= 0 ||
      !chatCompletion.choices[0].message.content
    ) {
      throw new Error('Failed to fetch chat response')
    }

    console.log('chatCompletion', chatCompletion)

    // Return success data
    return {
      data: {
        response: chatCompletion.choices[0].message.content,
      },
    }
  } catch (error) {
    // Handle and return errors
    return {
      error: extractErrorMessage(
        error,
        'Error getting NPC response in the Server Action'
      ),
    }
  }
}
