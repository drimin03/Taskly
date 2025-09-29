"use client"

import PageTransition from "@/components/page-transition"
import { BottomNav } from "@/components/bottom-nav"
import { ProjectsContent } from "@/components/projects-content"
import { useAuth } from "@/contexts/auth-context"
import { useFirebaseProjects, useFirebaseTasks } from "@/hooks/use-firebase-data"
import { useMemo } from "react"

export default function ProjectsPage() {
  const { user, loading } = useAuth()
  const { loading: projectsLoading } = useFirebaseProjects()
  const { loading: tasksLoading } = useFirebaseTasks()

  // Memoize the loading state to prevent unnecessary re-renders
  const loadingState = useMemo(() => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  ), [])

  // Show loading state while checking auth and fetching data
  if (loading || projectsLoading || tasksLoading) {
    return loadingState
  }

  // Show projects content for all users (dynamic for authenticated)
  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-pretty text-2xl font-semibold">
          {user ? "Projects" : "Sample Projects"}
        </h1>
        <p className="text-muted-foreground">
          {user 
            ? "Your active projects and boards." 
            : "Sign in to create and manage your own projects."}
        </p>
        <div className="mt-4">
          <ProjectsContent />
        </div>
      </main>
      <BottomNav />
    </PageTransition>
  )
}