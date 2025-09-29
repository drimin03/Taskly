"use client"

import { useMemo } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts"
import { useAuth } from "@/contexts/auth-context"

export function InsightsContent() {
  const { user } = useAuth()
  const { tasks, isLoading } = useTasks()

  // Calculate real insights data
  const insightsData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        weeklyCompleted: 0,
        activeProjects: 0,
        onTimeRate: 0,
        completionTrend: [],
        productivityScore: 0,
        tasksByTag: [],
        avgCompletionTime: 0
      }
    }

    // Calculate weekly completed tasks
    const completedTasks = tasks.filter(t => t.completed)
    const weeklyCompleted = completedTasks.length

    // Calculate active projects (tasks not completed)
    const activeProjects = tasks.filter(t => !t.completed).length

    // Calculate on-time rate (simplified - tasks completed before due date)
    let onTimeCount = 0
    let totalWithDueDate = 0
    let totalCompletionTime = 0
    let completedWithDates = 0
    
    completedTasks.forEach(task => {
      if (task.due && task.createdAt) {
        totalWithDueDate++
        const dueDate = new Date(task.due)
        const completedDate = new Date(task.createdAt)
        if (completedDate <= dueDate) {
          onTimeCount++
        }
        
        // Calculate completion time
        const completionTime = Math.max(0, (completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        totalCompletionTime += completionTime
        completedWithDates++
      }
    })
    
    const onTimeRate = totalWithDueDate > 0 ? Math.round((onTimeCount / totalWithDueDate) * 100) : 0
    const avgCompletionTime = completedWithDates > 0 ? (totalCompletionTime / completedWithDates).toFixed(1) : "0.0"

    // Calculate completion trend for the last 7 days
    const today = new Date()
    const completionTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      // Count tasks completed on this day
      const completedOnDay = completedTasks.filter(task => {
        if (task.createdAt) {
          const createdDate = new Date(task.createdAt)
          return createdDate.getDate() === date.getDate() && 
                 createdDate.getMonth() === date.getMonth() && 
                 createdDate.getFullYear() === date.getFullYear()
        }
        return false
      }).length
      
      completionTrend.push({
        day: dayName,
        completed: completedOnDay
      })
    }

    // Calculate tasks by tag
    const tagCounts: Record<string, number> = {}
    tasks.forEach(task => {
      const tag = task.tag || "Untagged"
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
    
    const tasksByTag = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate productivity score (weighted metric)
    const productivityScore = Math.min(100, Math.round(
      (weeklyCompleted * 2) + 
      (onTimeRate * 0.5) + 
      (activeProjects * -1) // Penalty for too many active tasks
    ))

    return {
      weeklyCompleted,
      activeProjects,
      onTimeRate,
      completionTrend,
      productivityScore,
      tasksByTag,
      avgCompletionTime
    }
  }, [tasks])

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Weekly Completed</p>
          <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
            {insightsData.weeklyCompleted}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Tasks</p>
          <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
            {insightsData.activeProjects}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">On-time Rate</p>
          <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
            {insightsData.onTimeRate}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Productivity</p>
          <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
            {insightsData.productivityScore}
          </p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Completion Trend Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-medium">Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insightsData.completionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={user ? "var(--color-primary)" : "hsl(var(--muted-foreground))"} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={user ? "var(--color-primary)" : "hsl(var(--muted-foreground))"} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke={user ? "var(--color-primary)" : "hsl(var(--muted-foreground))"}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Tag Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-medium">Tasks by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insightsData.tasksByTag} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  dataKey="tag" 
                  type="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  scale="band" 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Bar dataKey="count" barSize={20}>
                  {insightsData.tasksByTag.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={user ? `hsl(${200 + index * 20}, 80%, 60%)` : "hsl(var(--muted-foreground))"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Additional Metrics */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 font-medium">Average Completion Time</h3>
          <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
            {insightsData.avgCompletionTime} days
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Average time taken to complete tasks
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 font-medium">Top Category</h3>
          {insightsData.tasksByTag.length > 0 ? (
            <>
              <p className={`text-2xl font-bold ${!user && 'text-muted-foreground'}`}>
                {insightsData.tasksByTag[0].tag}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {insightsData.tasksByTag[0].count} tasks
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </div>
      </section>
      
      {!user && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to view your personalized productivity insights
          </p>
        </div>
      )}
    </div>
  )
}