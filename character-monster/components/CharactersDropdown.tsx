'use client'
import { fetchCharactersSA } from '@/actions/characters/fetchCharactersSA'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Character } from '@/lib/schemas'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { useState, useEffect } from 'react'

export function CharactersDropdown({
  className,
  onSelect,
  selected,
}: {
  className?: string
  onSelect?: (value: string) => void
  selected?: string
}) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<
    string | undefined
  >(undefined)

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await fetchCharactersSA()

      if (!data) {
        toast.info("You don't have any characters yet.")
        return
      }

      if (error) {
        console.error(error)
        toast.error(extractErrorMessage(error, 'Error fetching characters'))
        return
      }

      setCharacters(data.characters)
      if (data.characters.find((character) => character.id === selected)) {
        setSelectedCharacter(selected)
      }
    }
    fetchCharacters()
  }, [])

  const handleValueChange = (value: string) => {
    setSelectedCharacter(value)
    if (onSelect) {
      onSelect(value)
    }
  }

  return (
    <Select onValueChange={handleValueChange} value={selectedCharacter}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a Character" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Characters</SelectLabel>
          {characters.map((character) => (
            <SelectItem key={character.id} value={character.id}>
              {character.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
