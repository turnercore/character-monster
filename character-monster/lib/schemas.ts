// Zod Schemas and Types
import { z } from 'zod'

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
