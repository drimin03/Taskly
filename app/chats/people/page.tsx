"use client"

import { useRouter } from "next/navigation"
import PageTransition from "@/components/page-transition"
import BottomNav from "@/components/bottom-nav"
import { ChatInvites } from "@/components/chat-invites"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function PeoplePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <PageTransition>
        <main className="min-h-[calc(100dvh-4rem)] px-4 py-6 max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">Checking session…</p>
        </main>
        <BottomNav />
      </PageTransition>
    )
  }

  if (!user) {
    return (
      <PageTransition>
        <main className="min-h-[calc(100dvh-4rem)] px-4 py-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-pretty">People & Invites</h1>
            <Button onClick={() => router.push("/auth")}>Sign in</Button>
          </div>
          <p className="text-sm text-muted-foreground">Please sign in to send invites and chat.</p>
        </main>
        <BottomNav />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-[calc(100dvh-4rem)] px-4 py-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-pretty">People & Invites</h1>
          <Button variant="outline" onClick={() => router.push("/chats/general")}>
            Open General
          </Button>
        </div>
        <ChatInvites />
      </main>
      <BottomNav />
    </PageTransition>
  )
}