'use client'

import { set } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
const LENGTH_CAP = 1000

export default function ServerToastMessage({
  message,
  type,
  redirect,
}: {
  message: string
  type?: string
  redirect?: string
}) {
  const router = useRouter()
  const [delivered, setDelivered] = useState(false)
  console.log('toasting', delivered)

  useEffect(() => {
    if (delivered) return
    // Ensure message is string
    if (
      typeof message !== 'string' ||
      !message ||
      message.length === 0 ||
      message.length > LENGTH_CAP
    ) {
      toast.error('Invalid message')
      setDelivered(true)
    } else {
      switch (type) {
        case 'error':
          toast.error(message)
          break
        case 'warning':
          toast.warning(message)
          break
        case 'success':
          toast.success(message)
          break
        case 'info':
          toast.info(message)
          break
        case 'action':
          toast(message, {
            action: {
              label: 'Ok',
              onClick: () => toast.dismiss(),
            },
          })
          break
        default:
          toast.message(message)
          break
      }
    }
    setDelivered(true)

    if (redirect) {
      router.push(redirect)
    }
  }, [])

  return <></>
}
