'use client'
import { useEffect, useState } from 'react'
import { UUID } from '@/lib/schemas'
import { getMonsterTokenSA } from '@/actions/getMonsterTokenSA'
import { Button } from './ui'
import { createMonsterTokenSA } from '@/actions/createMonsterTokenSA'
import { toast } from 'sonner'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { GiPerspectiveDiceSixFacesOne } from 'react-icons/gi'
import { BsClipboard2 } from 'react-icons/bs'
import { BsClipboard2Check } from 'react-icons/bs'
import { Loader } from './ui/loader'

interface MonsterTokenProps {
  userId: UUID
}

export const MonsterToken = ({ userId }: MonsterTokenProps) => {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    // Get Api Token if it exsists
    const getMonsterToken = async () => {
      const { data: tokenData } = await getMonsterTokenSA()
      if (tokenData) {
        setToken(tokenData.token)
      }
      setLoading(false)
    }
    getMonsterToken()
  }, [userId])

  const handleCreateToken = async () => {
    setLoading(true)
    setHasCopied(false)
    // Create Api Token
    const { data, error } = await createMonsterTokenSA()

    if (error || !data?.token) {
      console.error(error)
      toast.error(extractErrorMessage(error, 'Failed to create token'))
    } else {
      setToken(data.token)
    }
    setLoading(false)
  }

  const handleCopyTokenToClipboard = () => {
    // Copy Api Token to clipboard
    navigator.clipboard.writeText(token)
    toast.success('Copied Token to Clipboard')
    setHasCopied(true)
  }

  if (loading) {
    return (
      <div className="max-w-[200px] flex flex-col items-center mx-auto">
        <p>Getting Token...</p>
        <Loader />
      </div>
    )
  }

  if (token) {
    return (
      <div className="flex flex-row space-y-4 space-x-2 items-center h-[100px]">
        <p className="text-center items-center align-center p-2 mt-3 w-full">
          {token}
        </p>
        <Button
          size="icon"
          aria-label="Recreate Token"
          onClick={handleCreateToken}
        >
          <GiPerspectiveDiceSixFacesOne className="w-3/4 h-3/4" />
        </Button>
        <Button
          size="icon"
          aria-label="Copy Token to Clipboard"
          onClick={handleCopyTokenToClipboard}
        >
          {hasCopied ? (
            <BsClipboard2Check className="w-3/4 h-3/4" />
          ) : (
            <BsClipboard2 className="w-3/4 h-3/4" />
          )}
        </Button>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col space-y-4">
        <p> No Token Found </p>
        <Button onClick={handleCreateToken}> Generate Token </Button>
      </div>
    )
  }
}
