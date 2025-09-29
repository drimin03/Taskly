"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEnsureRoom, useMessages, useSendMessage } from "@/hooks/use-chat"
import { useTyping } from "@/hooks/use-typing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IoSend, IoArrowBack } from "react-icons/io5"

interface Message {
  id: string
  text: string
  userId: string
  displayName?: string
  createdAt: any
}

interface RealtimeChatProps {
  roomId?: string
  roomName?: string
  messageClassName?: (senderId: string) => string
  renderMessage?: (msg: Message) => React.ReactNode
}

export function RealtimeChat({ 
  roomId = "general", 
  roomName = "General",
  messageClassName,
  renderMessage
}: RealtimeChatProps) {
  const { user } = useAuth()
  const router = useRouter()
  useEnsureRoom(roomId, roomName)
  const { messages, loading } = useMessages(roomId)
  const send = useSendMessage(roomId)
  const { text, setText, usersTyping } = useTyping(roomId)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!text.trim()) return
    await send(text)
    setText("")
  }

  function handleBack() {
    router.back()
  }

  if (!user) {
    return (
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle>Sign in to chat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-muted-foreground text-sm">You need to sign in to send messages.</p>
          <Button asChild className="bg-primary text-primary-foreground">
            <a href="/auth">Go to Sign In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Custom message rendering
  if (renderMessage) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 bg-white border-b">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <IoArrowBack size={24} />
          </button>
          <h2 className="text-lg font-semibold text-pretty flex-1">{roomName}</h2>
        </div>
        
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white">
          {loading && <div className="text-muted-foreground text-sm">Loading messages…</div>}
          {!loading && messages.length === 0 && <div className="text-muted-foreground text-sm">No messages yet. Say hi!</div>}
          {messages.map((msg) => renderMessage(msg))}
          {/* Typing indicators */}
          {usersTyping && Object.keys(usersTyping).filter(uid => usersTyping[uid] && uid !== user?.uid).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span>{Object.keys(usersTyping).filter(uid => usersTyping[uid] && uid !== user?.uid).length > 1 ? 'Several people' : 'Someone'} is typing...</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="p-3 bg-white border-t shadow-inner flex items-center gap-3">
          <Input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full flex items-center justify-center transition"
          >
            <IoSend size={20} />
          </button>
        </form>
      </div>
    )
  }

  // Default message rendering
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack size={24} />
        </button>
        <h2 className="text-lg font-semibold text-pretty flex-1">{roomName}</h2>
      </div>

      <Card className="bg-white border-border">
        <CardContent className="p-0">
          <div ref={listRef} className="max-h-[60vh] overflow-auto p-4 space-y-3 bg-white">
            {loading && <div className="text-muted-foreground text-sm">Loading messages…</div>}
            {!loading && messages.length === 0 && <div className="text-muted-foreground text-sm">No messages yet. Say hi!</div>}
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                <span className="text-xs opacity-70">{m.displayName}</span>
                <span className="px-3 py-2 rounded-md bg-white border border-border">{m.text}</span>
              </div>
            ))}
            {/* Typing indicators */}
            {usersTyping && Object.keys(usersTyping).filter(uid => usersTyping[uid] && uid !== user?.uid).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>{Object.keys(usersTyping).filter(uid => usersTyping[uid] && uid !== user?.uid).length > 1 ? 'Several people' : 'Someone'} is typing...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2 bg-white">
            <Input
              className="bg-white border-border flex-1"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" className="bg-primary text-primary-foreground">
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
