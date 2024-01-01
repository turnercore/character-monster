import { NextApiRequest, NextApiResponse } from 'next'
import { textToSpeechSA } from '@/actions/textToSpeechSA'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, res: NextApiResponse) {
  const body = await req.json()
  const { voiceId, text } = body
  console.log('voiceId', voiceId)
  console.log('text', text)
  const { data, error } = await textToSpeechSA({ voiceId, text })
  console.log(data)
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
