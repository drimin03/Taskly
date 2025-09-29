"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function InviteLanding() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ roomId: string }>()
  const roomId = params?.roomId || "general"

  useEffect(() => {
    if (user) {
      router.replace(`/chats/${roomId}`)
    }
  }, [user, roomId, router])

  return (
    <main className="p-6 max-w-md mx-auto grid gap-4">
      <h1 className="text-2xl font-semibold">You’ve been invited</h1>
      <p className="opacity-80">Sign in to join the “{roomId}” room and start chatting in real time.</p>
      <Button asChild className="bg-primary text-primary-foreground">
        <a href="/auth">Sign in to continue</a>
      </Button>
    </main>
  )
}