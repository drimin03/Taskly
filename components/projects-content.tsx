"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useFirebaseProjects, useFirebaseTasks } from "@/hooks/use-firebase-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { CreateProjectForm } from "@/components/create-project-form"

export function ProjectsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { projects, addProject } = useFirebaseProjects()
  const { tasks, addTask } = useFirebaseTasks()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  const tasksByProject = (pid?: string) => tasks.filter((t) => (pid ? t.projectId === pid : true))

  // Helper function to safely format dates
  const formatDueDate = (dueDate: any) => {
    if (!dueDate) return null
    
    try {
      let date: Date
      
      // Handle Firestore Timestamp
      if (dueDate.toDate && typeof dueDate.toDate === 'function') {
        date = dueDate.toDate()
      } 
      // Handle Date object
      else if (dueDate instanceof Date) {
        date = dueDate
      } 
      // Handle string or number
      else if (typeof dueDate === 'string' || typeof dueDate === 'number') {
        date = new Date(dueDate)
      }
      // Handle other objects
      else {
        date = new Date(dueDate)
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return null
      }
      
      return (
        <p className="text-xs text-muted-foreground mt-1">
          Due: {format(date, "MMM d")}
        </p>
      )
    } catch (e) {
      // Silently fail if date formatting fails
      return null
    }
  }

  const handleCreateProject = async (projectData: { 
    name: string; 
    dueDate?: Date; 
    dueTime?: string; 
    tasks: { id: string; title: string; dueDate?: Date; dueTime?: string }[] 
  }) => {
    if (!user) return
    
    try {
      // Create the project
      const projectId = await addProject({
        name: projectData.name,
        color: "#22a3a3", // Default color
        dueDate: projectData.dueDate,
        dueTime: projectData.dueTime
      })
      
      // Add tasks to the project
      for (const task of projectData.tasks) {
        await addTask({
          title: task.title,
          completed: false,
          projectId,
          dueDate: task.dueDate,
          dueTime: task.dueTime
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
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateProjectOpen(true)}>
              Create Project
            </Button>
          </div>
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
                  <p className="text-xs text-muted-foreground">
                    {done}/{pts.length} completed
                  </p>
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