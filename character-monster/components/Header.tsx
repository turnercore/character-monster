'use client'
import { Button } from '@/components/ui/button'
import { SheetTrigger, SheetContent, Sheet } from '@/components/ui/sheet'
import Link from 'next/link'
import UserAvatar from './UserAvatar'
import { LiaHamburgerSolid } from 'react-icons/lia'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

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
    <div className="flex items-center justify-between px-4 py-2 shadow-md">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="text-black" size="icon" variant="outline">
            <LiaHamburgerSolid className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-2xl font-bold py-2">Menu</h2>
          <Link className="block py-1 text-lg hover:underline" href="#">
            Home
          </Link>
          <Link className="block py-1 text-lg hover:underline" href="#">
            About
          </Link>
          <Link className="block py-1 text-lg hover:underline" href="#">
            Services
          </Link>
          <Link className="block py-1 text-lg hover:underline" href="#">
            Contact
          </Link>
        </SheetContent>
      </Sheet>
      <h1 className="text-3xl font-bold hover:underline">
        <Link href="/">{projectName}</Link>
      </h1>
      <UserAvatar user={user} />
    </div>
  )
}
