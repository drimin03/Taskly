"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useFirebaseProjects, useFirebaseTasks } from "@/hooks/use-firebase-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { CreateProjectForm, Task } from "@/components/create-project-form"

export function ProjectsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { projects, addProject } = useFirebaseProjects()
  const { tasks, addTask } = useFirebaseTasks()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  const tasksByProject = (pid?: string) => tasks.filter((t) => (pid ? t.projectId === pid : true))

  const formatDueDate = (dueDate: any) => {
    if (!dueDate) return null
    try {
      let date: Date
      if (dueDate.toDate && typeof dueDate.toDate === "function") date = dueDate.toDate()
      else if (dueDate instanceof Date) date = dueDate
      else date = new Date(dueDate)

      if (isNaN(date.getTime())) return null
      return <p className="text-xs text-muted-foreground mt-1">Due: {format(date, "MMM d")}</p>
    } catch {
      return null
    }
  }

  const handleCreateProject = async (projectData: { name: string; dueDate?: Date; tasks: Task[] }) => {
    if (!user) return

    try {
      const projectId = await addProject({
        name: projectData.name,
        color: "#22a3a3", // default color
        dueDate: projectData.dueDate ?? undefined, // ensure undefined
      })

      for (const task of projectData.tasks) {
        await addTask({
          title: task.title,
          completed: false,
          projectId,
          dueDate: task.dueDate ?? undefined // ensure undefined
        })
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  return (
    <div className="space-y-6">
      {user && (
        <section className="space-y-3">
          <Button onClick={() => setIsCreateProjectOpen(true)}>Create Project</Button>
        </section>
      )}

      <CreateProjectForm
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onSubmit={handleCreateProject}
      />

      <section>
        <h2 className="mb-3 text-sm font-medium">Projects</h2>
        <div className="grid grid-cols-2 gap-3">
          {projects.map((p) => {
            const pts = tasksByProject(p.id)
            const done = pts.filter((t) => t.completed).length
            const pct = pts.length ? Math.round((done / pts.length) * 100) : 0
            return (
              <Card
                key={p.id}
                className="border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => user && router.push(`/projects/${p.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{done}/{pts.length} completed</p>
                  {formatDueDate(p.dueDate)}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}