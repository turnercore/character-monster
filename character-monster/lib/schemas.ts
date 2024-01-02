// Zod Schemas and Types
import { z } from 'zod'
import { generateName } from './tools/nameGenerators'

export type ServerActionReturn<T> = {
  error?: string
  data?: T
}

// UUID Schema and Type
export const UUIDSchema = z.string().uuid()
export type UUID = z.infer<typeof UUIDSchema>

// HexColorCode Schema and Type
export const HexColorCodeSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{3}){1,2}$/i)
export type HexColorCode = z.infer<typeof HexColorCodeSchema>

// Profile Schema and Type
export const ProfileSchema = z
  .object({
    id: z.string(),
    username: z.string().nullable(),
    color: HexColorCodeSchema.nullable(),
    avatar_set: z.number().default(1),
  })
  .strip()

export type Profile = z.infer<typeof ProfileSchema>

// ColorPaletteItem Schema and Type
export const ColorPaletteSchema = z.record(z.array(UUIDSchema)).refine(
  (obj) => {
    return Object.keys(obj).every(
      (key) => HexColorCodeSchema.safeParse(key).success
    )
  },
  {
    message: 'All keys must be valid hex color codes',
  }
)
export type ColorPaletteType = z.infer<typeof ColorPaletteSchema>

// API Key Schema and Type
//     id uuid not null default gen_random_uuid (),
//     user_id uuid not null,

export const APIKeySchema = z.object({
  id: UUIDSchema,
  jwt: z.string(),
  user_id: UUIDSchema,
  logs: z.array(z.date()).nullable(),
})

export type APIKey = z.infer<typeof APIKeySchema>

// Third party API Key Schema and Type
// id uuid not null default auth.uid (),
// api_key text not null,
// owner uuid not null,
// type public.third_party_key_types not null default 'open_ai'::third_party_key_types,
// endpoint text

export const ThirdPartyAPIKeySchema = z.object({
  api_key: z.string(),
  owner: UUIDSchema,
  type: z.enum(['open_ai', 'elevenlabs']),
  endpoint: z.string().nullable(),
})

export type ThirdPartyAPIKey = z.infer<typeof ThirdPartyAPIKeySchema>

// Blurb Schema and Type
// id uuid not null default uuid_generate_v4 (),
// name text null,
// content text null,
// owner uuid not null,

export const BlurbSchema = z.object({
  id: UUIDSchema,
  name: z.string().nullable(),
  content: z.string().nullable(),
  owner: UUIDSchema,
})

export type Blurb = z.infer<typeof BlurbSchema>

// Character Schema and Type
// name text null,
// description text null,
// identity text null,
// voice text null,
// archived boolean not null default false,
// history text null,
// id uuid not null default gen_random_uuid (),
// knowledge uuid[] null,
// users uuid[] null,
// owner uuid not null,

export const CharacterSchema = z.object({
  id: UUIDSchema.default(() => UUIDSchema.parse(crypto.randomUUID())),
  name: z.string().default(generateName()),
  description: z.string().nullable(),
  identity: z.string().nullable(),
  voice: z.string().nullable(),
  archived: z.boolean().default(false),
  history: z.string().nullable(),
  knowledge: z.array(UUIDSchema).nullable(),
  users: z.array(UUIDSchema).nullable(),
  owner: UUIDSchema,
})

export type Character = z.infer<typeof CharacterSchema>
