"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { useFirebaseProjects, useFirebaseTasks } from "@/hooks/use-firebase-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { CreateProjectForm, Task } from "@/components/create-project-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ProjectsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { projects, addProject, deleteProject } = useFirebaseProjects()
  const { tasks, addTask } = useFirebaseTasks()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

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
      const projectData_clean: any = {
        name: projectData.name,
        color: "#22a3a3",
      }
      if (projectData.dueDate) {
        projectData_clean.dueDate = projectData.dueDate
      }
      
      const projectId = await addProject(projectData_clean)

      for (const task of projectData.tasks) {
        const taskData_clean: any = {
          title: task.title,
          completed: false,
          projectId,
        }
        if (task.dueDate) {
          taskData_clean.dueDate = task.dueDate
        }
        await addTask(taskData_clean)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    
    try {
      await deleteProject(projectToDelete)
      setProjectToDelete(null)
    } catch (error) {
      console.error("Error deleting project:", error)
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
                className="border-border hover:shadow-md transition-shadow relative"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => user && router.push(`/projects/${p.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base pr-8">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{done}/{pts.length} completed</p>
                    {formatDueDate(p.dueDate)}
                  </CardContent>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProjectToDelete(p.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </Card>
            )
          })}
        </div>
      </section>

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will remove all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}