'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        mounted
          ? `Switch to ${isDark ? 'light' : 'dark'} mode`
          : 'Toggle color theme'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-5" aria-hidden="true" />
        ) : (
          <Moon className="size-5" aria-hidden="true" />
        )
      ) : (
        <Sun className="size-5" aria-hidden="true" />
      )}
    </Button>
  )
}
