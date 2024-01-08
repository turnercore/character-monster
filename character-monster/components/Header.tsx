'use client'
import { Button } from '@/components/ui/button'
import { SheetTrigger, SheetContent, Sheet } from '@/components/ui/sheet'
import Link from 'next/link'
import UserAvatar from './UserAvatar'
import { PiHamburger } from 'react-icons/pi'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { ModeToggle } from './ui/mode-toggle'
import { AccessibilityOptionsDialog } from './AccessiblityOptionsDialog'

const projectName = 'Character.Monster'

export default function Header() {
  // User as state
  const [user, setUser] = useState<User | null>(null)
  // Get supabase client
  const supabase = createClient()

  // on mount, get user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (!data) {
        return
      }

      if (error) {
        console.error(error)
        return
      }

      setUser(data.user)
    }

    getUser()
  }, [])

  return (
    <div className="flex justify-between items-center px-4 py-2 shadow-md relative">
      {/* Left side */}
      <div className="flex items-center space-x-2 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Navigation Menu">
              <PiHamburger className="h-3/4 w-3/4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <h2 className="text-2xl font-bold py-2">Menu</h2>
            <Link className="block py-1 text-lg hover:underline" href="/">
              Home
            </Link>
            <Link
              className="block py-1 text-lg hover:underline"
              href="/characters"
            >
              Characters
            </Link>
            <Link
              className="block py-1 text-lg hover:underline"
              href="https://github.com/turnercore/character-monster"
            >
              Star on GitHub
            </Link>
          </SheetContent>
        </Sheet>
        <ModeToggle />
        <AccessibilityOptionsDialog />
      </div>

      {/* Middle (Center of the screen) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-3xl font-bold hover:underline md:flex hidden">
          <Link href="/">{projectName}</Link>
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center z-10">
        <UserAvatar user={user} />
      </div>
    </div>
  )
}
