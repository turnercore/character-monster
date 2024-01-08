import { getNpcResponseSA } from '@/actions/getNpcResponseSA'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { type NextRequest, NextResponse } from 'next/server'
import { getCharacterIdSA } from '@/actions/getCharacterIdSA'
import { z } from 'zod'

const inputSchema = z.object({
  prompt: z.string(), // The prompt to send to the AI
  character: z.string(), // The name of the character
  model: z.string().optional(),
  // Create more input options here
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const validatedBody = inputSchema.parse(body)

    const { prompt, character, model } = validatedBody
    console.log('getting character id')

    // Get characterid from name
    const { data: characterData, error: characterError } =
      await getCharacterIdSA(character)

    if (characterError || !characterData?.characterId)
      throw new Error(
        characterError || 'Failed to retrieve character data from Supabase'
      )

    const characterId = characterData.characterId

    const characterReponseInputs = {
      characterId,
      message: prompt,
      model,
    }
    const { data, error } = await getNpcResponseSA(characterReponseInputs)

    if (error || !data) {
      return new NextResponse(error, {
        status: 500,
        statusText: 'Error getting response from Elevenlabs',
      })
    }

    return NextResponse.json(data, {
      status: 200,
      statusText: 'OK',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: extractErrorMessage(
          error,
          'Unknown error from getNpcResponseSA.'
        ),
      },
      { status: 500 }
    )
  }
}
