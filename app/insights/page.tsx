"use client"

import PageTransition from "@/components/page-transition"
import { BottomNav } from "@/components/bottom-nav"
import { InsightsContent } from "@/components/insights-content"
import { useAuth } from "@/contexts/auth-context"

export default function InsightsPage() {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show insights content for all users (static for non-authenticated)
  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-pretty text-2xl font-semibold">
          {user ? "Insights" : "Sample Insights"}
        </h1>
        <p className="text-muted-foreground">
          {user 
            ? "Your weekly productivity stats." 
            : "Sign in to view your personalized productivity insights."}
        </p>
        <div className="mt-4">
          <InsightsContent />
        </div>
      </main>
      <BottomNav />
    </PageTransition>
  )
}