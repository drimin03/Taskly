"use client"

import { useEffect, useState } from "react"
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  arrayUnion,
} from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { cleanupOldMessages } from "@/lib/utils"

export function useEnsureRoom(roomId: string, name = "General") {
  const db = getFirebaseDB()
  const { user } = useAuth()
  useEffect(() => {
    if (!roomId || !user?.uid) return
    const ref = doc(db, "rooms", roomId)
    // Upsert without a read: create if missing, merge if exists, and ensure current user is a member
    setDoc(
      ref,
      {
        name,
        createdAt: serverTimestamp(),
        members: arrayUnion(user.uid),
      },
      { merge: true },
    ).catch((e) => {
      console.log("[v0] Failed to upsert room/membership", e)
    })
  }, [db, roomId, name, user?.uid])
}

export function useMessages(roomId: string) {
  const db = getFirebaseDB()
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; userId: string; displayName?: string; createdAt: any }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setMessages(rows)
      setLoading(false)
    })
    return () => unsub()
  }, [db, roomId])

  // Cleanup old messages periodically (once per session when messages are loaded)
  useEffect(() => {
    if (!roomId) return
    
    // Run cleanup once after messages are loaded
    const cleanupTimer = setTimeout(async () => {
      try {
        // Clean up messages older than 30 days
        await cleanupOldMessages(db, 30)
      } catch (error) {
        console.warn("Failed to cleanup old messages:", error)
      }
    }, 5000) // Wait 5 seconds after loading to avoid blocking UI

    return () => clearTimeout(cleanupTimer)
  }, [roomId, db])

  return { messages, loading }
}

export function useSendMessage(roomId: string) {
  const db = getFirebaseDB()
  const { user } = useAuth()
  return async function send(text: string) {
    if (!roomId) throw new Error("Missing roomId")
    if (!user) throw new Error("Must be signed in")
    const msg = {
      text: text.trim(),
      userId: user.uid,
      displayName: user.displayName || user.email || "User",
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, "rooms", roomId, "messages"), msg)
  }
}