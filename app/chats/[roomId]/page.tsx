"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useInvites } from "@/hooks/use-invites"
import { useUserById } from "@/hooks/use-users"
import { RealtimeChat } from "@/components/realtime-chat"

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>()
  const roomId = params?.roomId || "general"
  const { user } = useAuth()
  const { getOtherUserIdFromRoomId } = useInvites(user?.uid ?? null)

  // Get the other user's ID from the room ID
  const otherUserId = roomId !== "general" ? getOtherUserIdFromRoomId(roomId) : null

  // Get the other user's information
  const { user: otherUser } = useUserById(otherUserId)

  // Removed unread message functionality

  // Determine the room name to display
  const roomName =
    roomId === "general"
      ? "General"
      : otherUser
      ? otherUser.displayName
      : "Chat"

  return (
    <main className="fixed inset-0 top-16 bottom-20 md:bottom-0 flex flex-col bg-gray-50">
      <RealtimeChat
        roomId={roomId}
        roomName={roomName}
        renderMessage={(msg: any) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.userId === user?.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 text-sm shadow-sm ${
                msg.userId === user?.uid
                  ? "bg-green-500 text-white rounded-2xl rounded-br-none"
                  : "bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-200"
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {msg.createdAt?.toDate ? 
                  msg.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : 
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              </p>
            </div>
          </div>
        )}
      />
    </main>
  )
}