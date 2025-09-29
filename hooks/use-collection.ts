"use client"

import useSWR from "swr"
import { onSnapshot, query as makeQuery, type QueryConstraint, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useEffect, useRef } from "react"

type Doc<T> = T & { id: string }

export function useCollection<T = any>(path: string, constraints: QueryConstraint[] = [], key?: string) {
  const swrKey = key || `coll:${path}:${constraints.map(String).join("|")}`
  const unsubscribeRef = useRef<(() => void) | null>(null)
  
  const { data, error, mutate, isLoading } = useSWR<Doc<T>[]>(swrKey, {
    fetcher: () =>
      new Promise<Doc<T>[]>((resolve) => {
        // Clean up previous subscription if exists
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
        
        const q = makeQuery(collection(db, path), ...constraints)
        const unsub = onSnapshot(q, (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
          resolve(rows)
        })
        
        // Store unsubscribe function for cleanup
        unsubscribeRef.current = unsub
      }),
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000, // Reduce frequency of duplicate requests
  })

  // Live updates with proper cleanup
  useEffect(() => {
    const q = makeQuery(collection(db, path), ...constraints)
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
      mutate(rows, { revalidate: false })
    })
    
    return () => unsub()
  }, [path, mutate, ...constraints])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  return { data: data || [], error, isLoading }
}