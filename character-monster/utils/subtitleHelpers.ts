// Function to validate if a string is a valid SRT or VTT file

const srtPattern =
  /^(\d+\s*\r?\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\s*\r?\n.*\s*\r?\n)+$/
const vttPattern =
  /^WEBVTT.*(\r?\n\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}\s*\r?\n.*\s*\r?\n)+$/

export const isValidSubtitleFile = (fileContent: string) => {
  // Regular expressions for SRT and VTT formats
  return srtPattern.test(fileContent) || vttPattern.test(fileContent)
}

export const determineSubtitleKind = (fileContent: string) => {
  // Regular expressions for SRT and VTT formats
  if (srtPattern.test(fileContent)) return 'srt'
  if (vttPattern.test(fileContent)) return 'vtt'
  return 'unknown'
}
