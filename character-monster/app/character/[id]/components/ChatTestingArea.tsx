// ChatTestingArea.tsx
'use client'
import React, { useState, FormEvent, ReactElement } from 'react'
import {
  Input,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui' // Adjust import paths as needed
import { Character, UUID } from '@/lib/schemas'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getNpcResponseSA } from '@/actions/getNpcResponseSA'
import { toast } from 'sonner'
import extractErrorMessage from '@/lib/tools/extractErrorMessage'

const formSchema = z.object({
  input: z.string().min(1, { message: 'Please enter some text.' }),
  model: z.string().default('gpt-3.5-turbo'),
  system: z.string().optional(),
})

const ChatTestingArea = ({
  userId,
  character,
}: {
  userId: UUID
  character: Character
}) => {
  const [results, setResults] = useState<ReactElement>(() => <></>)
  const [loading, setLoading] = useState(false)
  const models = [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4-1106-preview',
    'gpt-4',
    'godzilla',
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { input: '' },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    // Get response from server
    const { data, error } = await getNpcResponseSA({
      characterId: character.id,
      message: values.input,
      model: values.model,
      system: values.system,
    })

    if (error || !data) {
      toast.error(extractErrorMessage(error, 'Error getting response'))
      setLoading(false)
      return
    }

    // For now, just setting the input text to the results
    const { response } = data

    setResults(
      <p>
        {`Player: ${values.input}`} <br /> {`NPC: ${response}`}
      </p>
    )
    setLoading(false)
  }

  return (
    <Card className="flex flex-col items-left mt-5 mx-5">
      <CardHeader className="text-2xl font-bold text-center">
        <CardTitle>Chat Testing Area</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Type your message" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model to use." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* System Message form field */}
            <FormField
              control={form.control}
              name="system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        'Try different system messages here. The default (for now) is: ' +
                        `You are an NPC named ${
                          character.name || 'NPC'
                        } in a tabletop roleplaying game. Anwser and engage the player, but never break character. Always answer in character.`
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
        <div className="mt-4">
          <h3>Results:</h3>
          <div className="border p-4">{results}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatTestingArea
