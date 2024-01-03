'use client'
import { Check, ChevronsUpDown, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DialogClose } from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import type { Blurb, UUID } from '@/lib/schemas'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createBlurbSA } from '@/actions/blurbs/createBlurbSA'
import { updateBlurbSA } from '@/actions/blurbs/updateBlurbSA'
import { deleteBlurbSA } from '@/actions/blurbs/deleteBlurbSA'
import { fetchBlurbsSA } from '@/actions/blurbs/fetchBlurbsSA'
import { Label } from '@/components/ui/label'
import { generateRandomUUID } from '@/lib/tools/generateRandomUUID'
import { Textarea } from '@/components/ui/textarea'

// FIXME: https://twitter.com/lemcii/status/1659649371162419202?s=46&t=gqNnMIjMWXiG2Rbrr5gT6g
// Removing states would help maybe?

const badgeStyle = (color: string) => ({
  borderColor: `${color}20`,
  backgroundColor: `${color}30`,
  color,
})

export function BlurbBox({
  userId,
  onSelectedValuesChange,
  initialBlurbs,
}: {
  initialBlurbs?: UUID[]
  userId: UUID
  onSelectedValuesChange: (selectedBlurbIds: UUID[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [blurbs, setBlurbs] = useState<Blurb[]>([])
  const [openCombobox, setOpenCombobox] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedValues, setSelectedValues] = useState<Blurb[]>([])
  const [selectedBlurbIds, setSelectedBlurbIds] = useState<UUID[]>([])

  // Fetch all the blurbs from the userId and set them as blurbs on mount
  useEffect(() => {
    const fetchBlurbs = async () => {
      const { data: fetchedBlurbs, error } = await fetchBlurbsSA({ userId })
      if (error || !fetchedBlurbs) {
        toast.error('Could not fetch blurbs \n ERROR: ' + error)
      } else {
        setBlurbs(fetchedBlurbs.blurbs)
        // Set selected blurbs if there are any
        if (initialBlurbs) {
          const selectedBlurbs = fetchedBlurbs.blurbs.filter(({ id }) =>
            initialBlurbs.includes(id)
          )
          setSelectedValues(selectedBlurbs)
          setSelectedBlurbIds(selectedBlurbs.map(({ id }) => id))
        }
      }
    }

    fetchBlurbs()
  }, [userId])

  // Update the callback function when selectedBlurbIds change
  useEffect(() => {
    onSelectedValuesChange(selectedBlurbIds)
    console.log('selectedBlurbIds', selectedBlurbIds)
  }, [selectedBlurbIds])

  // Helper functions with optimistic updates
  const createBlurb = (name: string) => {
    if (!userId) return

    const newBlurb: Blurb = {
      id: generateRandomUUID(),
      name,
      color: '#000000',
      owner: userId,
      content: '',
    }

    //OPTIMISTIC UPDATE
    const oldBlurbs = blurbs
    const oldSelectedValues = selectedValues
    const oldBlurbIds = selectedBlurbIds
    setBlurbs((prev) => [...prev, newBlurb])
    setSelectedValues((prev) => [...prev, newBlurb])
    setSelectedBlurbIds((prev) => [...prev, newBlurb.id])

    // Update with server action
    createBlurbSA({ blurb: newBlurb, user_id: userId }).then(({ error }) => {
      if (error) {
        //REVERT if it fails
        toast.error('Could not create blurb \n ERROR: ' + error)
        setBlurbs(oldBlurbs)
        setSelectedValues(oldSelectedValues)
        setSelectedBlurbIds(oldBlurbIds)
      } else {
        toast.info('Blurb created!')
      }
    })
  }

  // Toggle blurb as selected or not
  const toggleBlurb = (blurb: Blurb) => {
    setSelectedValues((currentBlurbs) =>
      !currentBlurbs.includes(blurb)
        ? [...currentBlurbs, blurb]
        : currentBlurbs.filter((l) => l.id !== blurb.id)
    )
    inputRef?.current?.focus()
    setSelectedBlurbIds((currentBlurbIds) =>
      !currentBlurbIds.includes(blurb.id)
        ? [...currentBlurbIds, blurb.id]
        : currentBlurbIds.filter((l) => l !== blurb.id)
    )
  }

  const updateBlurb = (blurbUpdates: Blurb) => {
    // Construct the updated blurb
    const {
      id: blurbId,
      name: newName,
      content: newContent,
      color: newColor,
    } = blurbUpdates

    const updatedBlurb = {
      id: blurbId,
      name: newName,
      content: newContent,
      color: newColor,
      owner: userId,
    }

    // OPTIMISTIC UPDATE
    const oldBlurbs = blurbs
    const oldSelectedValues = selectedValues
    const oldBlurbIds = selectedBlurbIds
    setBlurbs((prev) => prev.map((f) => (f.id === blurbId ? updatedBlurb : f)))
    setSelectedValues((prev) =>
      prev.map((f) => (f.id === blurbId ? updatedBlurb : f))
    )
    setSelectedBlurbIds((prev) =>
      prev.map((f) => (f === blurbId ? updatedBlurb.id : f))
    )

    // Update with server action
    updateBlurbSA({ id: blurbId, updates: updatedBlurb }).then(({ error }) => {
      if (error) {
        // REVERT
        setBlurbs(oldBlurbs)
        setSelectedValues(oldSelectedValues)
        setSelectedBlurbIds(oldBlurbIds)
        toast.error('Could not update blurb')
      } else {
        toast.info('Blurb updated!')
      }
    })
  }

  const deleteBlurb = (blurb: Blurb) => {
    //OPTIMISTIC UPDATE
    const oldBlurbs = blurbs
    const oldSelectedValues = selectedValues
    setBlurbs((prev) => prev.filter((f) => f.id !== blurb.id))
    setSelectedValues((prev) => prev.filter((f) => f.id !== blurb.id))

    // Update with server action
    deleteBlurbSA(blurb.id).then(({ error }) => {
      if (error) {
        //REVERT
        setBlurbs(oldBlurbs)
        setSelectedValues(oldSelectedValues)
        toast.error('Could not delete blurb \n ERROR: ' + error)
      } else {
        toast.info('Blurb deleted!')
      }
    })
  }

  const onComboboxOpenChange = (value: boolean) => {
    inputRef.current?.blur() // HACK: otherwise, would scroll automatically to the bottom of page
    setOpenCombobox(value)
  }

  return (
    <div className="max-w-full">
      <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCombobox}
            className="w-full justify-between text-foreground"
          >
            <span className="truncate">
              {selectedValues.length === 0 && 'Select blurbs'}
              {selectedValues.length === 1 && selectedValues[0].name}
              {selectedValues.length === 2 &&
                selectedValues.map(({ name }) => name).join(', ')}
              {selectedValues.length > 2 &&
                `${selectedValues.length} names selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[500px] min-w-[350px] p-0">
          <Command loop>
            <CommandInput
              ref={inputRef}
              placeholder="Search blurb..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandGroup className="max-h-[300px] overflow-auto">
              {blurbs.map((blurb) => {
                const isActive = selectedValues.includes(blurb)
                return (
                  <CommandItem
                    key={blurb.id}
                    value={blurb.name || blurb.id}
                    onSelect={() => toggleBlurb(blurb)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1">{blurb.name}</div>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: blurb.color || '#000000' }}
                    />
                  </CommandItem>
                )
              })}
              <CommandItemCreate
                onSelect={() => createBlurb(inputValue)}
                {...{ inputValue, blurbs }}
              />
            </CommandGroup>
            <CommandSeparator alwaysRender />
            <CommandGroup>
              <CommandItem
                value={`:${inputValue}:`}
                className="text-xs text-muted-foreground"
                onSelect={() => setOpenDialog(true)}
              >
                <div className={cn('mr-2 h-4 w-4')} />
                <Edit2 className="mr-2 h-2.5 w-2.5" />
                Edit Blurbs
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCombobox(true)
          }
          setOpenDialog(open)
        }}
      >
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Blurbs</DialogTitle>
            <DialogDescription>
              Create a blurb through the combobox. Update the blurb's name and
              content here.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-scroll -mx-6 px-6 flex-1 py-2">
            {blurbs.map((blurb) => (
              <DialogListItem
                key={blurb.id}
                onDelete={() => deleteBlurb(blurb)}
                onUpdate={(id, newName, newContent, newColor) => {
                  updateBlurb({
                    ...blurb,
                    name: newName,
                    content: newContent,
                    color: newColor,
                  })
                }}
                {...blurb}
              />
            ))}
          </div>
          <DialogFooter className="bg-opacity-40">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap mt-2">
        {selectedValues.map(({ name, id, color }) => (
          <Badge
            key={id}
            variant="outline"
            style={badgeStyle(color || '#000000')}
            className="mr-2 mb-2"
          >
            {name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

const CommandItemCreate = ({
  inputValue,
  blurbs,
  onSelect,
}: {
  inputValue: string
  blurbs: Blurb[]
  onSelect: () => void
}) => {
  const hasNoBlurb = !blurbs.map(({ id }) => id).includes(`${inputValue}`)

  const render = inputValue !== '' && hasNoBlurb

  if (!render) return null

  // BUG: whenever a space is appended, the Create-Button will not be shown.
  return (
    <CommandItem
      key={`${inputValue}`}
      value={`${inputValue}`}
      className="text-xs text-muted-foreground"
      onSelect={onSelect}
    >
      <div className={cn('mr-2 h-4 w-4')} />
      Create new name &quot;{inputValue}&quot;
    </CommandItem>
  )
}

const DialogListItem = ({
  id,
  name,
  content,
  color,
  onDelete,
  onUpdate,
}: Blurb & {
  onUpdate: (
    id: string,
    newName: string,
    newContent: string,
    newColor: string
  ) => void
  onDelete: () => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [accordionValue, setAccordionValue] = useState<string>('')
  const [inputName, setInputName] = useState<string>(name || '')
  const [inputContent, setInputContent] = useState<string>(content || '')
  const [inputColor, setInputColor] = useState<string>(color || '#000000')

  useEffect(() => {
    if (accordionValue !== '') {
      inputRef.current?.focus()
    }
  }, [accordionValue])

  const handleSave = () => {
    onUpdate(id, inputName, inputContent, inputColor)
    setAccordionValue('')
  }

  return (
    <Accordion
      key={id}
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
    >
      <AccordionItem value={id}>
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" style={badgeStyle(inputColor)}>
              {name}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <AccordionTrigger>Edit</AccordionTrigger>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="xs">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to delete the blurb "{name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <AccordionContent>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-4">
              <div className="flex-1 gap-3 grid">
                <Label htmlFor="name">Blurb Name</Label>
                <Input
                  ref={inputRef}
                  id="name"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="h-8 px-2 py-1"
                />
              </div>
            </div>
            <div className="w-full gap-3">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="h-20" // Adjust height as needed
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} size="xs">
                Save
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
