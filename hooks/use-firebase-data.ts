"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Task, Project } from "./use-mock-store"

export function useFirebaseProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: Project[] = []
      querySnapshot.forEach((doc) => {
        projectsData.push({
          id: doc.id,
          ...doc.data()
        } as Project)
      })
      setProjects(projectsData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching projects:", error)
      // Fallback to empty array on error
      setProjects([])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addProject = async (projectData: Omit<Project, "id">) => {
    if (!user) throw new Error("User not authenticated")
    
    const newProject = {
      ...projectData,
      userId: user.uid,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, "projects"), newProject)
    return docRef.id
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const projectRef = doc(db, "projects", projectId)
    await updateDoc(projectRef, updates)
  }

  const deleteProject = async (projectId: string) => {
    await deleteDoc(doc(db, "projects", projectId))
  }

  return { projects, loading, addProject, updateProject, deleteProject }
}

export function useFirebaseTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = []
      querySnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        } as Task)
      })
      setTasks(tasksData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching tasks:", error)
      // Fallback to empty array on error
      setTasks([])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addTask = async (taskData: Omit<Task, "id">) => {
    if (!user) throw new Error("User not authenticated")
    
    const newTask = {
      ...taskData,
      userId: user.uid,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, "tasks"), newTask)
    return docRef.id
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const taskRef = doc(db, "tasks", taskId)
    await updateDoc(taskRef, updates)
  }

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId))
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed })
  }

  return { tasks, loading, addTask, updateTask, deleteTask, toggleTaskCompletion }
}