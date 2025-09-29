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
  updateDoc,
  where,
  setDoc,
  arrayUnion,
  getDoc,
  getDocs,
} from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"

export interface Invite {
  id: string
  fromUid: string
  toUid: string
  status: "pending" | "accepted" | "rejected"
  createdAt?: any
  fromUser?: {
    uid: string
    displayName: string
    email: string
    photoURL: string
  }
  toUser?: {
    uid: string
    displayName: string
    email: string
    photoURL: string
  }
}

export function roomIdFor(u1: string, u2: string) {
  return ["room", ...[u1, u2].sort()].join("_")
}

export function useInvites(currentUid: string | null) {
  const db = getFirebaseDB()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  // Separate incoming and outgoing invites
  const incoming = invites.filter(invite => invite.toUid === currentUid)
  const outgoing = invites.filter(invite => invite.fromUid === currentUid)

  // Function to fetch user data
  const fetchUser = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() }
      }
      return null
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  useEffect(() => {
    if (!currentUid) {
      setInvites([])
      setLoading(false)
      return
    }
    
    // Single query to get all invites related to the current user
    const q = query(
      collection(db, "invites"), 
      orderBy("createdAt", "desc")
    )
    
    const unsubscribe = onSnapshot(q, async (snap) => {
      const list: Invite[] = []
      const userCache: Record<string, any> = {}
      
      // Process all documents and deduplicate by user pair
      const inviteMap = new Map<string, Invite>()
      
      for (const doc of snap.docs) {
        const inviteData = doc.data() as any
        // Only include invites where the current user is either sender or receiver
        if (inviteData.fromUid === currentUid || inviteData.toUid === currentUid) {
          const invite: Invite = { id: doc.id, ...inviteData }
          
          // Create a unique key for each user pair to prevent duplicates
          const userPairKey = [invite.fromUid, invite.toUid].sort().join("-")
          
          // Only keep the most recent invite for each user pair
          if (!inviteMap.has(userPairKey) || 
              (invite.createdAt && 
               (!inviteMap.get(userPairKey)?.createdAt || 
                invite.createdAt > inviteMap.get(userPairKey)?.createdAt))) {
            inviteMap.set(userPairKey, invite)
          }
        }
      }
      
      // Convert map back to array and fetch user data
      const invitesArray = Array.from(inviteMap.values())
      
      for (const invite of invitesArray) {
        // Fetch fromUser if not in cache
        if (invite.fromUid && !userCache[invite.fromUid]) {
          const user = await fetchUser(invite.fromUid)
          if (user) {
            userCache[invite.fromUid] = user
          }
        }
        
        // Fetch toUser if not in cache
        if (invite.toUid && !userCache[invite.toUid]) {
          const user = await fetchUser(invite.toUid)
          if (user) {
            userCache[invite.toUid] = user
          }
        }
        
        // Add user data to invite
        if (userCache[invite.fromUid]) {
          invite.fromUser = userCache[invite.fromUid]
        }
        
        if (userCache[invite.toUid]) {
          invite.toUser = userCache[invite.toUid]
        }
        
        list.push(invite)
      }
      
      setInvites(list)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching invites:", error)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [db, currentUid])

  // Function to get the other user's ID from a room ID
  const getOtherUserIdFromRoomId = (roomId: string): string | null => {
    if (!currentUid) return null
    
    // Find an invite where this room ID would be generated
    const invite = invites.find(invite => {
      const expectedRoomId = roomIdFor(invite.fromUid, invite.toUid)
      return expectedRoomId === roomId
    })
    
    if (!invite) return null
    
    // Return the other user's ID (not the current user)
    return invite.fromUid === currentUid ? invite.toUid : invite.fromUid
  }

  const sendInvite = async (toUid: string) => {
    if (!currentUid || currentUid === toUid) return
    
    // Check if an invite already exists between these users
    const existingInvite = invites.find(invite => 
      (invite.fromUid === currentUid && invite.toUid === toUid) ||
      (invite.fromUid === toUid && invite.toUid === currentUid)
    )
    
    // If an accepted invite already exists, just navigate to the chat
    if (existingInvite && existingInvite.status === "accepted") {
      return
    }
    
    // If a pending invite already exists, don't create another one
    if (existingInvite && existingInvite.status === "pending") {
      return
    }
    
    // create or upsert the room with both members so either side has access immediately
    const rid = roomIdFor(currentUid, toUid)
    await setDoc(
      doc(db, "rooms", rid),
      {
        name: "Direct Message",
        createdAt: serverTimestamp(),
        members: [currentUid, toUid],
      },
      { merge: true },
    )
    await addDoc(collection(db, "invites"), {
      fromUid: currentUid,
      toUid,
      status: "pending",
      createdAt: serverTimestamp(),
    })
  }

  const acceptInvite = async (invite: Invite) => {
    if (!currentUid) return null
    await updateDoc(doc(db, "invites", invite.id), { status: "accepted" })
    const rid = roomIdFor(invite.fromUid, invite.toUid)
    // ensure recipient is included (idempotent)
    await setDoc(doc(db, "rooms", rid), { members: arrayUnion(currentUid) }, { merge: true })
    return rid
  }

  const rejectInvite = async (inviteId: string) => {
    await updateDoc(doc(db, "invites", inviteId), { status: "rejected" })
  }

  return { incoming, outgoing, sendInvite, acceptInvite, rejectInvite, roomIdFor, loading, getOtherUserIdFromRoomId }
}