"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { CheckCircle, Clock, Plus, XCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react"
import { useFirebaseTasks } from "@/hooks/use-firebase-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useInvites } from "@/hooks/use-invites"
import { HomeSkeleton } from "@/components/home-skeleton"

export function HomeContent() {
  const { user } = useAuth()
  const { tasks, loading: isLoading, toggleTaskCompletion, addTask } = useFirebaseTasks()
  const { incoming, loading: invitesLoading } = useInvites(user?.uid || null)
  const [isClient, setIsClient] = useState(false)
  
  // Move all useState hooks to the top to avoid "Rendered more hooks than during the previous render" error
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [tag, setTag] = useState("")
  const [due, setDue] = useState("Today")
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])
  
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
  
  const onAdd = async () => {
    if (!title.trim()) return
    if (!user) return
    
    try {
      await addTask({
        title: title.trim(),
        tag: tag || undefined,
        due: due || undefined,
        completed: false
      })
      
      // Reset the form
      setTitle("")
      setTag("")
      setDue("Today")
      setOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  // Show skeleton while loading or if not on client
  if (isLoading || !isClient) {
    return <HomeSkeleton />
  }
  
  // For non-authenticated users, show static demo data
  const displayTasks = user ? tasks : [
    { id: '1', title: 'Complete project proposal', tag: 'Work', due: 'Today', completed: false },
    { id: '2', title: 'Review team feedback', tag: 'Work', due: 'Tomorrow', completed: true },
    { id: '3', title: 'Schedule meeting with client', tag: 'Meetings', due: 'Friday', completed: false },
  ]
  
  const completed = displayTasks.filter((t) => t.completed).length
  const total = displayTasks.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  // Removed pendingInvites logic since we're removing notification badges

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">Today&apos;s Progress</h2>
          <span className="text-xs text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </section>

      {/* Notifications Section */}
      <section className="rounded-lg border border-border bg-card">
        <button
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Notifications</h3>
            {/* Removed notification badge */}
          </div>
          {showNotifications ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        
        {showNotifications && (
          <div className="border-t border-border p-4">
            {/* Removed pending invites list since we're removing notification badges */}
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Your Tasks</h3>
          {user && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8">
                  <Plus className="mr-1 h-4 w-4" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input placeholder="Tag (optional)" value={tag} onChange={(e) => setTag(e.target.value)} />
                  <div className="text-xs text-muted-foreground">Due: {due}</div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={onAdd}>
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <ul className="space-y-3">
          {displayTasks.map((t) => {
            // Determine task status
            let statusIcon, statusColor
            if (t.completed) {
              statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />
              statusColor = "border-green-500 bg-green-50"
            } else if (t.dueDate) {
              const today = new Date()
              const dueDate = new Date(t.dueDate)
              // Set time to 00:00:00 for date comparison
              today.setHours(0, 0, 0, 0)
              dueDate.setHours(0, 0, 0, 0)
              
              if (dueDate < today) {
                statusIcon = <XCircle className="h-5 w-5 text-red-500" />
                statusColor = "border-red-500 bg-red-50"
              } else if (dueDate.getTime() === today.getTime()) {
                statusIcon = <Clock className="h-5 w-5 text-orange-500" />
                statusColor = "border-orange-500 bg-orange-50"
              } else {
                statusIcon = <Clock className="h-5 w-5 text-blue-500" />
                statusColor = "border-blue-500 bg-blue-50"
              }
            } else {
              statusIcon = <Clock className="h-5 w-5 text-orange-500" />
              statusColor = "border-orange-500 bg-orange-50"
            }
            
            const isExpanded = expandedTaskId === t.id
            
            return (
              <li 
                key={t.id} 
                className={`rounded-lg border ${statusColor}`}
              >
                <div className="flex items-center justify-between p-3">
                  <button
                    onClick={() => user && toggleTaskCompletion(t.id, !t.completed)}
                    className="inline-flex items-center gap-2 text-left"
                    aria-pressed={t.completed}
                    disabled={!user}
                  >
                    {statusIcon}
                    <div>
                      <p className={`font-medium ${!user && 'text-muted-foreground'}`}>
                        {t.title}
                      </p>
                      <p className={`text-xs ${user ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                        {t.tag ? `${t.tag} • ` : ""}Due {t.due || "—"}
                        {t.dueDate && ` • ${formatSafeDate(t.dueDate, "MMM d")}`}
                      </p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => toggleTaskExpansion(t.id)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-border bg-muted/50 p-3">
                    <div className="text-sm">
                      <p><span className="font-medium">Status:</span> {t.completed ? "Completed" : "Pending"}</p>
                      <p><span className="font-medium">Tag:</span> {t.tag || "None"}</p>
                      <p><span className="font-medium">Due:</span> {t.due || "Not set"}</p>
                      {t.dueDate && (
                        <p><span className="font-medium">Due Date:</span> {formatSafeDate(t.dueDate, "PPP")}</p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        
        {!user && (
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to add, edit, and manage your tasks
            </p>
          </div>
        )}
      </section>
    </div>
  )
}