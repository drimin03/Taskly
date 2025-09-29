"use client"

import { HomeContent } from "@/components/home-content"
import { useAuth } from "@/contexts/auth-context"
import { HomeSkeleton } from "@/components/home-skeleton"
import { useEffect, useState, useMemo } from "react"

export default function Page() {
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoize the skeleton to prevent unnecessary re-renders
  const skeleton = useMemo(() => (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <HomeSkeleton />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  ), [])

  // Show skeleton loader while checking auth
  if (loading || !isClient) {
    return skeleton
  }

  // Show welcome message for all users, but dynamic content only for authenticated users
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-pretty text-2xl font-semibold">
          {user ? `Welcome back, ${user.displayName || 'User'}` : 'Welcome to Taskly'}
        </h1>
        <p className="text-muted-foreground">
          {user 
            ? "Stay on top of your tasks today." 
            : "Sign in to manage your tasks and collaborate with your team."}
        </p>
      </header>
      <HomeContent />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom nav */}
    </main>
  )
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  )
}