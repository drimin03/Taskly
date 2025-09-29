"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useTyping(roomId: string) {
  const { usersTyping, setTyping } = useAuth()
  const [text, setText] = useState("")

  // Handle typing indicators
  useEffect(() => {
    let typingTimer: NodeJS.Timeout
    
    const handleTyping = () => {
      setTyping(roomId, true)
      clearTimeout(typingTimer)
      typingTimer = setTimeout(() => {
        setTyping(roomId, false)
      }, 1000) // Stop typing indicator after 1 second of inactivity
    }

    // Set up typing indicator when user types
    if (text.trim()) {
      handleTyping()
    } else {
      setTyping(roomId, false)
    }

    return () => {
      clearTimeout(typingTimer)
      setTyping(roomId, false)
    }
  }, [text, roomId, setTyping])

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
  }, [])

  return {
    text,
    setText: handleTextChange,
    usersTyping
  }
}