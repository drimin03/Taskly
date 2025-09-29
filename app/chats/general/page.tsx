"use client"

import { RealtimeChat } from "@/components/realtime-chat"

export default function GeneralChatPage() {
  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <RealtimeChat
        roomId="general"
        roomName="General"
        renderMessage={(msg: any) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.userId === "current-user-id" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 text-sm shadow-sm ${
                msg.userId === "current-user-id"
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