// app/providers.jsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" enableSystem attribute="class">
      {children}
    </ThemeProvider>
  )
}
