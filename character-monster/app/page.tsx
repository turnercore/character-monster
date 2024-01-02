import Header from '@/components/Header'
import Link from 'next/link'

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Character Monster</h1>
      </main>
    </div>
  )
}
