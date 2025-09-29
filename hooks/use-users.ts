"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"

export interface PublicUser {
  uid: string
  displayName: string
  email: string
  photoURL: string
  isOnline?: boolean
}

export function useUsers(currentUser: FirebaseUser | null, usersPresence: Record<string, boolean> = {}) {
  const db = getFirebaseDB()
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("displayName"))
    const unsub = onSnapshot(q, (snap) => {
      const list: PublicUser[] = []
      snap.forEach((d) => {
        const u = d.data() as any
        list.push({
          uid: u.uid,
          displayName: u.displayName || "",
          email: u.email || "",
          photoURL: u.photoURL || "",
          isOnline: usersPresence[u.uid] || false
        })
      })
      setUsers(list)
      setLoading(false)
    })
    return () => unsub()
  }, [db, usersPresence])

  const filtered = useMemo(
    () => users.filter((u) => (currentUser ? u.uid !== currentUser.uid : true)),
    [users, currentUser],
  )

  return { users: filtered, loading }
}

export function useUserById(userId: string | null) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const db = getFirebaseDB()

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          setUser({
            uid: userDoc.id,
            ...userDoc.data() as any
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, db])

  return { user, loading }
}