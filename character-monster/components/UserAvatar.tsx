'use client'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  Button,
} from '@/components/ui'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { type Profile, ProfileSchema } from '@/lib/schemas'
import { GoGear, GoSignOut } from 'react-icons/go'
import hash from '@/lib/tools/hash'
import fetchSupabaseProfileSA from '@/actions/fetchSupabaseProfileSA'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { useRouter } from 'next/navigation'
import { type User } from '@supabase/supabase-js'

interface UserAvatarProps {
  className?: string
  user?: User | null
}

const UserAvatar = ({ className, user }: UserAvatarProps) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  //Get user on mount
  useEffect(() => {
    const getSupabaseUser = async () => {
      if (!user) return
      try {
        // Now get the profile
        const { data: profileData, error: profileError } =
          await fetchSupabaseProfileSA(user.id)

        // Validate output of fetchSupabaseProfileSA
        const validatedProfileData = ProfileSchema.parse(profileData)

        setProfile(validatedProfileData)

        setIsLoading(false)
      } catch (error) {
        console.error(extractErrorMessage(error, 'Error getting user'))
      }
    }

    getSupabaseUser()
  }, [user])

  const signOut = () => {
    router.push('/account/logout')
    setProfile(null)
  }

  if (!user || !profile)
    return (
      <Link href="/account/login" className="text-lg hover:underline">
        Login
      </Link>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className={`h-[45px] w-[45px] hover:scale-110 drop-shadow-md hover:drop-shadow-xl ${className}`}
          style={{ backgroundColor: profile.color || '#FFFFFF' }}
        >
          <AvatarImage
            style={{ backgroundColor: profile.color || '#FFFFFF' }}
            src={`https://robohash.org/${hash(
              profile.username || 'clocktower'
            )}?set=set${profile.avatar_set}&size=64x64`}
          />
          <AvatarFallback>CT</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-center">
          {profile.username}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href="/account/profile">
            <DropdownMenuItem>
              <GoGear className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <Button variant="link" onClick={signOut}>
            <DropdownMenuItem>
              <GoSignOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAvatar
