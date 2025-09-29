"use client"

import { ChatInvites } from "@/components/chat-invites"

export default function InvitesPanel() {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Chat Invites</h2>
      <div className="pt-2">
        <ChatInvites />
      </div>
    </section>
  )
}