'use client'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { type Voice, getVoicesSA } from '@/actions/getVoicesSA'
import { toast } from 'sonner'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import { Character, UUIDSchema, type UUID } from '@/lib/schemas'
import { BlurbBox } from '@/components/blurb-box'
import { createCharacterSA } from '@/actions/characters/createCharacterSA'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().optional(),
  identity: z.string().optional(),
  voice: z.string().optional(),
  history: z.string().optional(),
  knowledge: z.array(UUIDSchema).optional(),
})

export default function CreateCharacterForm({ userId }: { userId: UUID }) {
  const [voices, setVoices] = useState<Voice[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchVoices = async () => {
      const { data, error } = await getVoicesSA()
      if (error || !data) {
        toast.error(extractErrorMessage(error, "Can't fetch voices"))
      } else {
        setVoices(data.voices || [])
      }
    }

    fetchVoices()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      identity: '',
      voice: '',
      history: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const character: Character = {
      id: generateRandomUUID(),
      name: values.name || 'Unnamed Soldier',
      description: values.description || '',
      identity: values.identity || '',
      voice: values.voice || null,
      history: values.history || '',
      knowledge: values.knowledge || null,
      owner: userId,
      archived: false,
      users: [userId],
    }

    const { data, error } = await createCharacterSA({ character })

    if (error || !data) {
      toast.error(extractErrorMessage(error, "Can't create character"))
    } else {
      toast.success(`${character.name} joins the world!`)
      router.push(`/character/${character.id}`)
    }
  }
  const handleBlurbBoxChange = (values: UUID[]) => {
    form.setValue('knowledge', values)
  }

  return (
    <Card className="flex flex-col items-left max-w-[500px] mx-auto mt-10">
      <CardHeader className="text-2xl font-bold text-center">
        <CardTitle>Create Character</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Character Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Identity" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {voices && voices.length > 0 && (
              <FormField
                control={form.control}
                name="voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem
                            key={voice.voice_id}
                            value={voice.voice_id}
                          >
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="History" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="knowledge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge</FormLabel>
                  <FormControl>
                    <BlurbBox
                      userId={userId}
                      onSelectedValuesChange={handleBlurbBoxChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create Character</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
