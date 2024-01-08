import { textToSpeechSA } from '@/actions/textToSpeechSA'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { voiceId, text } = body
  const { data, error } = await textToSpeechSA({ voiceId, text })
  console.log(error)

  if (error || !data) {
    return new NextResponse(error, {
      status: 500,
      statusText: 'Error getting response from Elevenlabs',
    })
  }

  const headers = new Headers()
  headers.set('Content-Type', 'audio/mpeg')

  return new NextResponse(data.file, { status: 200, statusText: 'OK', headers })
}
