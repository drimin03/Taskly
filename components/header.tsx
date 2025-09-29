"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { User2, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import InstallButton from "./install-button"
import { getFirebaseAuth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useState, useEffect } from "react"

export function Header() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // Don't render auth-dependent components on the server
  if (!isClient) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>Taskly</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span>Taskly</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <InstallButton />
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline">{user.displayName || user.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User2 className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignIn}
              className="gap-2"
            >
              <LogIn className="h-3 w-3" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}