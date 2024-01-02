import React, { Suspense } from 'react'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/app/providers'
import { Toaster } from '@/components/ui'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import '@/styles/globals.css'
import { Viewport, Metadata } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
}

const metadata: Metadata = {
  title: 'Character.Monster - Talk to your NPCs',
  applicationName: 'Character Monster',
  description:
    'Talk to your NPCs with a discord bot. Supports text-to-speech and text generation.',
  creator: 'Turner Monroe (turnercore)',
  authors: [{ name: 'Turner Monroe', url: 'https://github.com/turnercore' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ckd1nmz.css" />
        {/* Additional metadata and styles as needed */}
      </head>
      <body
        className={`${GeistSans.className} min-w-full bg-background text-foreground`}
      >
        <Providers>
          <div className="flex flex-col w-full min-h-screen min-w-screen  bg-main-background-layered-waves-svg bg-cover dark:bg-main-background-layered-waves-dark-svg">
            <Suspense
              fallback={
                <div className="relative bg-[#A6D3C9] dark:bg-opacity-20 bg-opacity-50 top-0 w-full flex justify-between items-center p-4 space-x-2"></div>
              }
            >
              <Header />
            </Suspense>
            <Suspense>
              <main className="w-full flex-1 mt-3">{children}</main>
            </Suspense>
            <Toaster />
          </div>
          <Suspense>
            <Footer />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
