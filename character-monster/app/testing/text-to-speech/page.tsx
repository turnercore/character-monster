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
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'

const formSchema = z.object({
  text: z.string().min(1, { message: 'Please enter some text.' }),
  voiceId: z.string().min(1, { message: 'Please select a voice.' }),
})

// Page
export default function TextToSpeechPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [audioSrc, setAudioSrc] = useState('')

  useEffect(() => {
    const fetchVoices = async () => {
      const { data, error } = await getVoicesSA()
      if (error || !data) {
        toast.error(extractErrorMessage(error, "Can't find elevenLabs Api Key"))
      }
      setVoices(data?.voices || [])
    }

    fetchVoices()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      voiceId: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/v1/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error('Server responded with an error')
      }

      const blob = await response.blob()
      setAudioSrc(URL.createObjectURL(blob))
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Something went wrong'))
    }
  }

  return (
    <Card className="flex flex-col items-left max-w-[500px] mx-auto mt-10">
      <CardHeader className="text-2xl font-bold text-center">
        <CardTitle>Text to Speech Test</CardTitle>
        <CardDescription className="text-left">
          Demo of the ElevenLabs Text to Speech API using this site's API.
          <br />
          This WILL count against your ElevenLabs account's usage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Enter your text</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="min-h-[100px] border-2 border-gray-300 rounded-md p-2"
                      placeholder="Type your text here"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {voices.length > 0 && (
              <FormField
                control={form.control}
                name="voiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select a voice</FormLabel>
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
                        {voices.map((voice: any) => (
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
            <Button type="submit" disabled={voices.length <= 0}>
              Submit
            </Button>
            {audioSrc && (
              <audio className="w-full mt-4" controls src={audioSrc}>
                Your browser does not support the audio element.
              </audio>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
