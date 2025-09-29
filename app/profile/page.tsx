"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { BottomNav } from "@/components/bottom-nav"
import { Preferences } from "@/components/prefs"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignIn = () => {
    router.push("/auth")
  }

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      // Redirect to home page after logout
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

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

  // Show profile content for authenticated users, sign-in prompt for others
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-pretty text-2xl font-semibold">Profile & Settings</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-accent flex items-center justify-center" aria-hidden>
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
          <h2 className="text-lg font-medium">Sign in to access your profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view and manage your profile settings
          </p>
          <Button onClick={handleSignIn} className="mt-4 gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </div>
        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium">Appearance</h2>
          <ThemeToggle />
        </section>
        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-medium">Preferences</h2>
          <Preferences />
        </section>
        <BottomNav />
      </main>
    )
  }

  // If user is authenticated, show the profile content
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-pretty text-2xl font-semibold">Profile & Settings</h1>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-accent" aria-hidden />
        <div>
          <p className="font-medium">{user.displayName || 'User'}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-medium">Account</h2>
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </section>
      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-medium">Appearance</h2>
        <ThemeToggle />
      </section>
      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-medium">Preferences</h2>
        <Preferences />
      </section>
      <BottomNav />
    </main>
  )
}