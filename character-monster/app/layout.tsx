import { GeistSans } from 'geist/font/sans'
import { Toaster } from '@/components/ui'
import '@/styles/globals.css'
import AuthButton from '@/components/AuthButton'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <Header />
        <main className="min-h-screen flex flex-col items-center">
          <AuthButton />
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
