'use client'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { type Voice, getVoicesSA } from '@/actions/getVoicesSA'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
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
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'
import {
  Character,
  UUIDSchema,
  type UUID,
  type CharacterField,
  CharacterSchema,
} from '@/lib/schemas'
import { BlurbBox } from '@/components/blurb-box'
import { updateCharacterSA } from '@/actions/characters/updateCharacterSA'
import { useRouter } from 'next/navigation'
import { MdOutlinePlaylistAdd, MdPlaylistRemove } from 'react-icons/md'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { createCharacterSA } from '@/actions/characters/createCharacterSA'

const formSchema = z.object({
  name: z.string().min(1, { message: 'What should we call them?' }),
  identity: z.string().min(1, {
    message:
      'Give this character some kind of identity or they may have a crisis.',
  }),
  voice: z.string().default(''),
  history: z.string().default(''),
  fields: z
    .array(z.object({ name: z.string(), content: z.string() }))
    .default([]),
  knowledge: z.array(UUIDSchema).default([]),
})

export default function CharacterEditor({
  userId,
  characterData,
  varient,
}: {
  userId: UUID
  characterData?: Character
  varient: 'edit' | 'create'
}) {
  const [updating, setUpdating] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [fields, setFields] = useState<CharacterField[]>(
    characterData?.fields || []
  )

  const router = useRouter()

  if (varient === 'edit' && !characterData) {
    return <div>Error, must include characterData if this is an edit.</div>
  }

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
    defaultValues: characterData
      ? {
          name: characterData.name || '',
          identity: characterData.identity || '',
          voice: characterData.voice || '',
          history: characterData.history || '',
          fields: fields || [],
          knowledge: characterData.knowledge || [],
        }
      : {
          name: '',
          identity: '',
          voice: '',
          history: '',
          fields: [],
          knowledge: [],
        },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setUpdating(true)
    const updatedCharacter: Character = characterData
      ? {
          ...characterData,
          ...values,
        }
      : {
          // Default character data added
          id: generateRandomUUID(),
          owner: userId,
          archived: false,
          users: [userId],
          ...values,
        }

    const { data, error } =
      varient === 'create'
        ? await createCharacterSA({ character: updatedCharacter })
        : await updateCharacterSA({
            id: characterData!.id,
            updates: updatedCharacter,
          })

    if (error || !data) {
      if (varient === 'create')
        toast.error(extractErrorMessage(error, "Can't update character"))
      else toast.error(extractErrorMessage(error, "Can't create character"))
    } else {
      if (varient === 'create')
        toast.success(`${updatedCharacter.name} joins the world!`)
      else toast.success(`${updatedCharacter.name} updated successfully!`)

      router.push(`/character/${updatedCharacter.id}`)
    }

    setUpdating(false)
  }

  const handleBlurbBoxChange = (values: UUID[]) => {
    form.setValue('knowledge', values)
  }

  console.log(characterData?.knowledge)

  return (
    <Card className="flex flex-col items-left mt-5 mx-5">
      <CardHeader className="text-2xl font-bold text-center">
        <CardTitle>Edit Character</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <h1 className="text-lg font-semibold">Required Fields</h1>
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
              name="identity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity</FormLabel>
                  <FormDescription>
                    This is the character's base identity that is unique to
                    them.
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} placeholder="Identity" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h1 className="text-lg font-semibold">Optional Fields</h1>
            <FormField
              control={form.control}
              name="knowledge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge</FormLabel>
                  <FormDescription>
                    Knowledge about the world that the character knows about.
                    Each blurb can be known by multiple characters. Create and
                    edit blurbs within the menu.
                  </FormDescription>
                  <FormControl>
                    <BlurbBox
                      userId={userId}
                      initialBlurbs={characterData?.knowledge || []}
                      onSelectedValuesChange={handleBlurbBoxChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice (optional)</FormLabel>
                  <FormDescription> Used for text-to-speech. </FormDescription>
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
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h1 className="text-lg font-semibold">Addtional Fields</h1>
            <p>
              Add additional fields to your character. These will be unique to
              this character and can be whatever you want.
            </p>
            <div className="flex flex-col space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" size="sm" variant="destructive">
                          <MdPlaylistRemove className="h-3/4 w-3/4">
                            Remove Field
                          </MdPlaylistRemove>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {`Remove Field: ${field.name} ?`}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this field? This
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="vibrating-element bg-red-500"
                            onClick={() => {
                              const newFields = [...fields]
                              newFields.splice(index, 1)
                              setFields(newFields)
                              form.setValue('fields', newFields)
                            }}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              <div className="flex align-center mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newFields = [...fields]
                    newFields.push({ name: '', content: '' })
                    setFields(newFields)
                    form.setValue('fields', newFields)
                  }}
                >
                  <MdOutlinePlaylistAdd className="w-3/4 h-3/4" />
                  <p>Add Field</p>
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History</FormLabel>
                  <FormDescription>
                    This is a special field which will fill out as you chat with
                    the NPC and add events to their history. You can edit it
                    directly, but you must stay within the history format.
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} placeholder="History" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Character'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
