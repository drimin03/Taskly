"use client"

import { addDoc, collection, doc, serverTimestamp, updateDoc, query, where } from "firebase/firestore"
import { useCollection } from "./use-collection"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export type Task = {
  id: string
  title: string
  tag?: string
  due?: string
  completed?: boolean
  createdAt?: any
  userId?: string
}

export function useTasks() {
  const { user } = useAuth()
  
  // Create a query constraint for the current user
  const constraints = user ? [where("userId", "==", user.uid)] : []
  
  const { data: tasks, isLoading, error } = useCollection<Task>(
    "tasks", 
    constraints, 
    user ? `tasks:user:${user.uid}` : "tasks:demo"
  )

  const progress = tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0

  async function addTask(input: Pick<Task, "title" | "tag" | "due">) {
    if (!user) {
      throw new Error("User must be authenticated to add tasks")
    }
    
    await addDoc(collection(db, "tasks"), {
      ...input,
      completed: false,
      createdAt: serverTimestamp(),
      userId: user.uid
    })
  }

  async function toggleTask(id: string, completed: boolean) {
    if (!user) {
      throw new Error("User must be authenticated to toggle tasks")
    }
    
    await updateDoc(doc(db, "tasks", id), { completed })
  }

  return { tasks, isLoading, error, progress, addTask, toggleTask }
}