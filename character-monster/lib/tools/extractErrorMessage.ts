import { ZodError } from 'zod'

// Extracts an error message from an error object
// Returns the error message as a string
// If no error message is present, returns the default error message
const extractErrorMessage = (
  error:
    | string
    | Error
    | ZodError
    | { message?: string; code?: string; details?: string; hint?: string }
    | unknown,
  defaultErrorMessage: string = 'Unknown error has occurred.'
): string => {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof ZodError) {
    return formatZodErrors(error.format())
  }

  if (error instanceof Error) {
    return error.message
  }

  // Check for Supabase error structure
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const supabaseError = error as {
      message: string
      code?: string
      details?: string
      hint?: string
    }
    return supabaseError.message
  }

  return defaultErrorMessage
}

const formatZodErrors = (errors: any): string => {
  //Example:     { _errors: [], variable1: { _errors: [ 'Required' ] }, variable2: { _errors: ['Not valid hex']} }
  let result = ''
  //Frist add 'Global Errors: '
  if (errors._errors.length > 0) {
    result += 'Global Errors: '
    errors._errors.forEach((error: string) => {
      result += error + ' '
    })
  }
  // Now go through all the rest of the errors and add their messages
  // Should be, for example 'variable1 Errors: Required, Must be a string, Whatever else \n variable2 Errors: Not valid hex, Must be a string, Whatever else'
  for (const key in errors) {
    if (key !== '_errors') {
      result += key + ' Errors: '
      errors[key]._errors.forEach((error: string) => {
        result += error + ' '
      })
    }
  }

  return result.trim()
}

export default extractErrorMessage
