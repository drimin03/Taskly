"use client"

import useSWR from "swr"

export type Task = {
  id: string
  title: string
  tag?: string
  due?: string
  completed: boolean
  projectId?: string
  dueDate?: Date
  dueTime?: string
}

export type Project = {
  id: string
  name: string
  color?: string
  dueDate?: Date
  dueTime?: string
}

export type Message = {
  id: string
  from: "me" | "other"
  text: string
  timestamp: string
}

type State = {
  tasks: Task[]
  projects: Project[]
  messages: Message[]
}

const state: State = {
  tasks: [
    { id: "t1", title: "Design home hero", tag: "Design", due: "Today", completed: false, projectId: "p1" },
    { id: "t2", title: "Set up auth flow", tag: "Dev", due: "Tomorrow", completed: false, projectId: "p2" },
    { id: "t3", title: "Write onboarding copy", tag: "Writing", due: "Fri", completed: true, projectId: "p1" },
    { id: "t4", title: "QA mobile layouts", tag: "QA", due: "Mon", completed: false, projectId: "p3" },
    { id: "t5", title: "Team sync agenda", tag: "PM", due: "Today", completed: false, projectId: "p2" },
  ],
  projects: [
    { id: "p1", name: "Marketing Site", color: "var(--color-primary)" },
    { id: "p2", name: "Taskly App", color: "var(--color-accent-1, #22a3a3)" },
    { id: "p3", name: "Internal Tools", color: "var(--color-accent-2, #f59e0b)" },
  ],
  messages: [
    { id: "m1", from: "other", text: "Hey! Should we split the tasks by milestone?", timestamp: "09:00" },
    { id: "m2", from: "me", text: "Yes—let’s group by sprint goals and due dates.", timestamp: "09:02" },
    { id: "m3", from: "other", text: "Cool, I’ll start a new board in Projects.", timestamp: "09:05" },
  ],
}

const tasksFetcher = async () => state.tasks
const projectsFetcher = async () => state.projects
const messagesFetcher = async () => state.messages

export function useTasks() {
  const { data, mutate } = useSWR<Task[]>("tasks", tasksFetcher, { fallbackData: state.tasks })

  const toggleTask = (id: string) => {
    mutate(
      (curr) => {
        const next = (curr ?? []).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        state.tasks = next
        return next
      },
      { revalidate: false },
    )
  }

  const addTask = (title: string, opts?: Partial<Task>) => {
    mutate(
      (curr) => {
        const next: Task[] = [
          ...(curr ?? []),
          {
            id: `t${Date.now()}`,
            title,
            completed: false,
            tag: opts?.tag,
            due: opts?.due,
            projectId: opts?.projectId,
          },
        ]
        state.tasks = next
        return next
      },
      { revalidate: false },
    )
  }

  return { tasks: data ?? [], toggleTask, addTask }
}

export function useProjects() {
  const { data } = useSWR<Project[]>("projects", projectsFetcher, { fallbackData: state.projects })
  return { projects: data ?? [] }
}

export function useMessages() {
  const { data, mutate } = useSWR<Message[]>("messages", messagesFetcher, { fallbackData: state.messages })

  const send = (text: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    mutate(
      (curr) => {
        const next = [...(curr ?? []), { id: `m${Date.now()}`, from: "me" as const, text, timestamp: ts }]
        state.messages = next
        return next
      },
      { revalidate: false },
    )
  }

  return { messages: data ?? [], send }
}
