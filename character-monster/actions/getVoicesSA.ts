'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { fetchThirdPartyKeySA } from './fetchThirdPartyKeySA' // Adjust the import path as needed

// Type definitions for the response
export type Voice = {
  voice_id: string
  name: string
  // Add more fields as needed
}

type ReturnData = {
  voices: Voice[]
}

export async function getVoicesSA(): Promise<ServerActionReturn<ReturnData>> {
  try {
    const { data: apiKeyData, error: apiKeyError } = await fetchThirdPartyKeySA(
      'elevenlabs'
    )
    if (apiKeyError || !apiKeyData)
      throw new Error(apiKeyError || 'No ElevenLabs API key found')

    const ElevenLabsApiKey = apiKeyData.apiKey

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: { 'xi-api-key': ElevenLabsApiKey },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch voices')
    }

    const data = await response.json()
    const voices = data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      // Map other necessary fields if needed
    }))

    return {
      data: { voices },
    }
  } catch (error) {
    return { error: extractErrorMessage(error) }
  }
}
