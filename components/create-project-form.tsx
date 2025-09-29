"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Task {
  id: string
  title: string
  dueDate?: Date
}

export function CreateProjectForm({ 
  open, 
  onOpenChange,
  onSubmit
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (projectData: { name: string; dueDate?: Date; tasks: Task[] }) => void
}) {
  const [projectName, setProjectName] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [tasks, setTasks] = useState<Task[]>([{ id: Date.now().toString(), title: "", dueDate: undefined }])
  
  const handleAddTask = () => {
    setTasks([...tasks, { id: Date.now().toString(), title: "", dueDate: undefined }])
  }
  
  const handleTaskChange = (id: string, field: keyof Task, value: string | Date | undefined) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ))
  }
  
  const handleRemoveTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== id))
    }
  }
  
  const handleSubmit = () => {
    if (!projectName.trim()) return
    
    onSubmit({
      name: projectName,
      dueDate,
      tasks: tasks.filter(task => task.title.trim() !== "")
    })
    
    // Reset form
    setProjectName("")
    setDueDate(undefined)
    setTasks([{ id: Date.now().toString(), title: "", dueDate: undefined }])
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!dueDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {tasks.map((task, index) => (
                <div key={task.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={task.title}
                      onChange={(e) => handleTaskChange(task.id, "title", e.target.value)}
                      placeholder={`Task ${index + 1}`}
                    />
                    {tasks.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveTask(task.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-xs">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          size="sm"
                          className={`w-full justify-start text-left font-normal text-xs ${!task.dueDate && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {task.dueDate ? format(task.dueDate, "MMM d") : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={task.dueDate}
                          onSelect={(date) => handleTaskChange(task.id, "dueDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!projectName.trim()}>
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}