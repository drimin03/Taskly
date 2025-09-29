"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { getFirebaseDB } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { usePresence } from "@/hooks/use-presence"

interface AuthContextType {
  user: User | null
  loading: boolean
  usersPresence: Record<string, boolean>
  usersTyping: Record<string, boolean>
  setTyping: (roomId: string, isTyping: boolean) => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, usersPresence: {}, usersTyping: {}, setTyping: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { usersPresence, usersTyping, setTyping } = usePresence()

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      // Set loading to false immediately when we get the auth state
      setLoading(false)
    })
    
    // Add a timeout to prevent indefinite loading (reduced from 3000 to 1500ms)
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - showing app anyway")
        setLoading(false)
      }
    }, 1500)
    
    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [])

  // Update user profile in Firestore when user changes (debounced)
  useEffect(() => {
    if (!user) return
    
    // Debounce the profile update to prevent excessive writes
    const debounceTimer = setTimeout(async () => {
      try {
        const db = getFirebaseDB()
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
      } catch (e) {
        console.log("[v0] Failed to upsert user profile", e)
      }
    }, 1000)
    
    return () => clearTimeout(debounceTimer)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, usersPresence, usersTyping, setTyping }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}