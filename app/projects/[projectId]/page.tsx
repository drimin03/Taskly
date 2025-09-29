"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { useFirebaseProjects, useFirebaseTasks } from "@/hooks/use-firebase-data"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PageTransition from "@/components/page-transition"
import { BottomNav } from "@/components/bottom-nav"

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { projects, loading: projectsLoading } = useFirebaseProjects()
  const { tasks, loading: tasksLoading, toggleTaskCompletion, addTask } = useFirebaseTasks()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  
  const projectId = params.projectId as string
  const project = projects.find(p => p.id === projectId)
  
  // Safe date formatting function
  const formatSafeDate = (date: any, formatStr: string) => {
    if (!date) return ""
    
    try {
      let parsedDate: Date
      
      // Handle Firestore Timestamp
      if (date.toDate && typeof date.toDate === 'function') {
        parsedDate = date.toDate()
      } 
      // Handle Date object
      else if (date instanceof Date) {
        parsedDate = date
      } 
      // Handle string or number
      else if (typeof date === 'string' || typeof date === 'number') {
        parsedDate = new Date(date)
      }
      // Handle other objects
      else {
        parsedDate = new Date(date)
      }
      
      // Validate the date
      if (isNaN(parsedDate.getTime())) {
        return ""
      }
      
      return format(parsedDate, formatStr)
    } catch (e) {
      return ""
    }
  }
  
  // Filter tasks for this project
  const projectTasks = tasks.filter(t => t.projectId === projectId)
  
  // Task status counts
  const completedTasks = projectTasks.filter(t => t.completed)
  const pendingTasks = projectTasks.filter(t => !t.completed)
  const overdueTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false
    const today = new Date()
    const dueDate = new Date(t.dueDate)
    return dueDate < today
  })
  
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user) return
    
    try {
      await addTask({
        title: newTaskTitle.trim(),
        completed: false,
        projectId
      })
      setNewTaskTitle("")
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }
  
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return
    await toggleTaskCompletion(taskId, completed)
  }
  
  // Redirect if project not found
  useEffect(() => {
    if (!projectsLoading && project === undefined) {
      router.push("/projects")
    }
  }, [project, projectsLoading, router])
  
  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <PageTransition>
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Project Not Found</h1>
            <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => router.push("/projects")}>
              Back to Projects
            </Button>
          </div>
        </main>
        <BottomNav />
      </PageTransition>
    )
  }
  
  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/projects")} className="mb-4">
            ← Back to Projects
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.dueDate && (
            <p className="text-muted-foreground">
              Due: {formatSafeDate(project.dueDate, "PPP")}
              {project.dueTime && ` at ${project.dueTime}`}
            </p>
          )}
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a new task"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                />
                <Button onClick={handleAddTask}>Add</Button>
              </div>
            )}
            
            <div className="space-y-3">
              {projectTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No tasks yet. {user ? "Add a task to get started." : "Sign in to add tasks."}
                </p>
              ) : (
                projectTasks.map((task) => {
                  // Determine task status
                  let statusIcon, statusColor, statusText
                  if (task.completed) {
                    statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />
                    statusColor = "border-green-500 bg-green-50"
                    statusText = "Completed"
                  } else if (task.dueDate) {
                    const today = new Date()
                    const dueDate = new Date(task.dueDate)
                    // Set time to 00:00:00 for date comparison
                    today.setHours(0, 0, 0, 0)
                    dueDate.setHours(0, 0, 0, 0)
                    
                    if (dueDate < today) {
                      statusIcon = <XCircle className="h-5 w-5 text-red-500" />
                      statusColor = "border-red-500 bg-red-50"
                      statusText = "Overdue"
                    } else if (dueDate.getTime() === today.getTime()) {
                      statusIcon = <Clock className="h-5 w-5 text-orange-500" />
                      statusColor = "border-orange-500 bg-orange-50"
                      statusText = "Due Today"
                    } else {
                      statusIcon = <Clock className="h-5 w-5 text-blue-500" />
                      statusColor = "border-blue-500 bg-blue-50"
                      statusText = "Pending"
                    }
                  } else {
                    statusIcon = <Clock className="h-5 w-5 text-orange-500" />
                    statusColor = "border-orange-500 bg-orange-50"
                    statusText = "Pending"
                  }
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between rounded-lg border p-3 ${statusColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => user && handleTaskToggle(task.id, !task.completed)}
                          disabled={!user}
                          className="flex items-center"
                          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {statusIcon}
                        </button>
                        <div>
                          <p className={`font-medium ${!user && 'text-muted-foreground'} ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {statusText}
                            {task.dueDate && ` • ${formatSafeDate(task.dueDate, "MMM d")}`}
                            {task.dueTime && ` at ${task.dueTime}`}
                          </p>
                        </div>
                      </div>
                      {/* Unified checkmark/circle icon for toggling task status */}
                      {user && (
                        <button
                          onClick={() => handleTaskToggle(task.id, !task.completed)}
                          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {task.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                          )}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </PageTransition>
  )
}