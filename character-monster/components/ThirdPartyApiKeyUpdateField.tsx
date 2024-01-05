'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui' // Ensure correct import paths
import { toast } from 'sonner'
import { upsertThirdPartyApiKeySA } from '@/actions/upsertThirdPartyApiKeySA' // Import your action to update the key
import { type SupportedServices, type UUID } from '@/lib/schemas'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'

export const ThirdPartyApiKeyUpdateField = ({
  userId,
  service,
}: {
  userId: UUID
  service: SupportedServices
}) => {
  const [apiKey, setApiKey] = useState('')

  const handleUpdateApiKey = async () => {
    if (!apiKey) return
    if (apiKey.length !== 32 && service === 'elevenlabs') {
      toast.error('API Key must be 32 characters.')
      return
    }

    if (apiKey.length !== 51 && service === 'open_ai') {
      toast.error('API key must be 51 characters.')
      return
    }

    const { error } = await upsertThirdPartyApiKeySA({
      apiKey,
      service,
    })
    if (error) {
      toast.error(extractErrorMessage(error, `Can't update ${service} API key`))
    } else {
      toast.success(`Your ${service} API key has been updated.`)
      //refresh the page
      location.reload()
    }
  }

  return (
    <Input
      className="w-3/4"
      type="text"
      value={apiKey}
      onChange={(e) => setApiKey(e.target.value)}
      onBlur={handleUpdateApiKey}
      placeholder={`Enter your ${service} API key here`}
    />
  )
}
