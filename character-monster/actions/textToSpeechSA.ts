// @/actions/textToSpeechSA.ts
'use server'
import { ServerActionReturn } from '@/lib/types'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { z } from 'zod'
import { fetchElevenLabsApiKeySA } from './fetchElevenLabsApiKeySA'

// Type definitions
type ReturnData = {
  file: Buffer // Represents the MP3 file
}

// Zod validation of input data
const inputSchema = z.object({
  voiceId: z.string(),
  text: z.string(),
})

export async function textToSpeechSA(input: {
  voiceId: string
  text: string
}): Promise<ServerActionReturn<ReturnData>> {
  try {
    // Validate input
    const { text, voiceId } = inputSchema.parse(input)

    // Fetch ElevenLabs API key
    const { data: elevenLabsKeyData, error: elevenLabsKeyError } =
      await fetchElevenLabsApiKeySA()
    if (elevenLabsKeyError || !elevenLabsKeyData) {
      throw new Error(elevenLabsKeyError || 'No ElevenLabs API key found')
    }

    const elevenLabsKey = elevenLabsKeyData.apiKey

    // Fetch voice settings from ElevenLabs
    const voiceOptions = {
      method: 'GET',
      headers: { 'xi-api-key': elevenLabsKey },
    }
    const voiceResponse = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voiceId}?with_settings=true`,
      voiceOptions
    )
    const voiceData = await voiceResponse.json()

    // Prepare text-to-speech request
    const ttsOptions = {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: process.env.EL_MODEL_ID,
        text: text,
        voice_settings: voiceData.settings,
      }),
    }

    // Make the text-to-speech request
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      ttsOptions
    )
    if (!ttsResponse.ok) {
      throw new Error('Failed to fetch MP3 data')
    }
    const ttsData = await ttsResponse.arrayBuffer() // Get the response as ArrayBuffer

    // Return success data
    return {
      data: {
        file: Buffer.from(ttsData), // Convert ArrayBuffer to Buffer
      },
    }
  } catch (error) {
    // Handle and return errors
    return {
      error: extractErrorMessage(
        error,
        'Error getting text to speech in the Server Action'
      ),
    }
  }
}
