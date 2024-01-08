'use client'
import { CharactersDropdown } from '@/components/CharactersDropdown'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
} from '@/components/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Characters() {
  const router = useRouter()
  const redirectToCharacterPage = (characterId: string) => {
    router.push(`/character/${characterId}`)
  }

  return (
    <Card className="max-w-[500px] mx-auto mt-10">
      <CardHeader className="items-center">
        <CardTitle>Select or Create a Character</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-10">
          <div>
            <Label>Select a Character</Label>
            <CharactersDropdown onSelect={redirectToCharacterPage} />
          </div>
          <Button className="w-3/4 mx-auto" asChild>
            <Link href="/character/create"> Create a Character</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
