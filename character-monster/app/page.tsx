import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Welcome to Character.Monster
        </h1>
        <p className="text-xl mb-8">
          Generate lifelike NPC dialogues and voices for your RPG adventures!
        </p>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/character/create">Create NPC</Link>
          </Button>
          <Button disabled={true} variant="outline" asChild>
            <Link href="/discord-bot">Discord Bot</Link>
          </Button>
          <Button disabled={false} variant="outline" asChild>
            <Link href="/testing/text-to-speech">Text to Speech</Link>
          </Button>
        </div>
        <div className="mt-10">
          <iframe
            className="rounded-xl"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with your video
            title="Character.Monster Intro"
            allowFullScreen
          ></iframe>
        </div>
      </main>
    </div>
  )
}

export default HomePage
