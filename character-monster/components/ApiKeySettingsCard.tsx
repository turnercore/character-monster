import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
} from './ui'
import { ThirdPartyApiKeyUpdateField } from './ThirdPartyApiKeyUpdateField'
import { UUID } from '@/lib/schemas'
import { MonsterToken } from './MonsterToken'

interface ApiKeySettingsCardProps {
  userId: UUID
}

export const ApiKeySettingsCard: React.FC<ApiKeySettingsCardProps> = ({
  userId,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Settings</CardTitle>
        <CardDescription>
          Update your Monster Token or Third Party API keys here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <h1 className=" text-lg "> Monster Token </h1>
            <p>
              This is your token for interacting with the site with the Discord
              bot or other external applications. Treat this token as you would
              your login credetials.
            </p>
            <MonsterToken userId={userId} />
          </div>
          <div className="flex flex-col space-y-4 pt-10">
            <h1 className=" text-lg ">Third Party API Keys</h1>
            <p>This is where you can add API keys for third party services.</p>
            <Label> Open AI API Key </Label>
            <ThirdPartyApiKeyUpdateField userId={userId} service="open_ai" />
            <p>
              Open AI is used for text generation. Will open up for other
              endpoints in the future.
            </p>
            <Label>ElevenLabs API Key</Label>
            <ThirdPartyApiKeyUpdateField userId={userId} service="elevenlabs" />
            <p> ElevenLabs is used for voice generation. </p>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default ApiKeySettingsCard
