"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only run this effect on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by rendering a placeholder during SSR
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent"
        aria-label="Toggle dark mode"
      >
        <div className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
        <span aria-hidden className="text-xs">Theme</span>
      </button>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent"
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
      <span aria-hidden className="text-xs">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  )
}
