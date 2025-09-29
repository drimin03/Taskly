"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useMessages } from "@/hooks/use-mock-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Paperclip, Mic } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function ChatThread() {
  const { user } = useAuth()
  const { messages, send } = useMessages()
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !text.trim()) return
    send(text.trim())
    setText("")
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border bg-card">
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={m.from === "me" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.from === "me"
                  ? "max-w-[75%] rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
                  : "max-w-[75%] rounded-lg border border-border bg-background px-3 py-2 text-xs"
              }
              aria-label={m.from === "me" ? "Sent message" : "Received message"}
            >
              <p>{m.text}</p>
              <p className="mt-1 text-[10px] opacity-70">{m.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-border p-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Add emoji" disabled={!user}>
          <Smile className="h-5 w-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Attach file" disabled={!user}>
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={text}
          onChange={(e) => user && setText(e.target.value)}
          placeholder={user ? "Write a message..." : "Sign in to send messages"}
          className="flex-1"
          disabled={!user}
        />
        <Button type="button" variant="ghost" size="icon" aria-label="Record voice" disabled={!user}>
          <Mic className="h-5 w-5" />
        </Button>
        <Button type="submit" className="ml-1" disabled={!user}>
          Send
        </Button>
      </form>
      
      {!user && (
        <div className="p-3 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            Sign in to participate in the conversation
          </p>
        </div>
      )}
    </div>
  )
}