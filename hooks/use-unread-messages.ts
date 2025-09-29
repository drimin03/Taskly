"use client"

import { useEffect, useState, useMemo } from "react"
import { collection, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore"
import { getFirebaseDB } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useInvites, roomIdFor } from "@/hooks/use-invites"

// Track unread messages per user
export function useUnreadMessagesByUser() {
  // Return empty object instead of tracking unread messages
  return { 
    unreadCounts: {}, 
    loading: false, 
    markAsRead: (userId: string) => {} 
  }
}
