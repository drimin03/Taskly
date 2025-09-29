"use client"

import AuthForm from "@/components/auth-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AuthSkeleton } from "@/components/auth-skeleton"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace("/chats/general")
    }
  }, [user, router])

  // Show skeleton loader while checking auth
  if (loading) {
    return <AuthSkeleton />
  }

  // If user is not authenticated, show the auth form centered
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Taskly</h1>
            <p className="text-muted-foreground mt-2">Sign in to manage your tasks and chat with your team</p>
          </div>
          <AuthForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    )
  }

  // This shouldn't be reached, but just in case
  return null
}