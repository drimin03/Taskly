"use client"

import { useEffect, useState, useRef } from "react"
import { onValue, ref, serverTimestamp, set, onDisconnect, get } from "firebase/database"
import { getFirebaseRTDB } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function usePresence() {
  const { user } = useAuth()
  const [usersPresence, setUsersPresence] = useState<Record<string, boolean>>({})
  const [usersTyping, setUsersTyping] = useState<Record<string, boolean>>({})
  const rtdb = getFirebaseRTDB()
  const userStatusRef = useRef<any>(null)

  // Listen for presence changes of all users
  useEffect(() => {
    const presenceRef = ref(rtdb, 'presence')
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert the presence data to boolean values
        const presenceBooleans: Record<string, boolean> = {}
        Object.keys(data).forEach(uid => {
          presenceBooleans[uid] = data[uid].state === 'online'
        })
        setUsersPresence(presenceBooleans)
      }
    })

    return () => unsubscribe()
  }, [rtdb])

  // Listen for typing indicators
  useEffect(() => {
    const typingRef = ref(rtdb, 'typing')
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setUsersTyping(data)
      }
    })

    return () => unsubscribe()
  }, [rtdb])

  // Set up current user's presence
  useEffect(() => {
    if (!user || !rtdb) return

    const userStatusDatabaseRef = ref(rtdb, `presence/${user.uid}`)
    
    // We need to set up the connection state monitoring
    const isOfflineData = {
      state: 'offline',
      last_changed: serverTimestamp(),
    }

    const isOnlineData = {
      state: 'online',
      last_changed: serverTimestamp(),
    }

    // Create a reference to the special '.info/connected' path in RTDB
    const connectedRef = ref(rtdb, '.info/connected')

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        // Client is offline, we don't need to do anything special
        return
      }

      // Client is online, set up the disconnect hook
      onDisconnect(userStatusDatabaseRef).set(isOfflineData).then(() => {
        // Set the user's status to online
        set(userStatusDatabaseRef, isOnlineData)
      })
    })

    return () => {
      unsubscribe()
      // When the component unmounts, set the user as offline
      if (userStatusDatabaseRef) {
        set(userStatusDatabaseRef, isOfflineData)
      }
    }
  }, [user, rtdb])

  // Function to set typing status
  const setTyping = (roomId: string, isTyping: boolean) => {
    if (!user || !rtdb) return
    
    const typingRef = ref(rtdb, `typing/${roomId}/${user.uid}`)
    if (isTyping) {
      set(typingRef, {
        userId: user.uid,
        displayName: user.displayName || user.email || 'User',
        timestamp: serverTimestamp()
      })
    } else {
      set(typingRef, null)
    }
  }

  return { usersPresence, usersTyping, setTyping }
}