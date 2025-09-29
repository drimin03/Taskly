"use client"

import { useUsers } from "@/hooks/use-users"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface UsersListProps {
  onUserSelect?: (userId: string) => void
}

export function UsersList({ onUserSelect }: UsersListProps) {
  const { user, usersPresence } = useAuth()
  const { users, loading } = useUsers(user, usersPresence)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div 
          key={u.uid} 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
          onClick={() => onUserSelect?.(u.uid)}
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={u.photoURL || undefined} />
              <AvatarFallback>{u.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            {usersPresence[u.uid] === true && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{u.displayName || u.email}</p>
            <p className="text-xs text-muted-foreground">
              {usersPresence[u.uid] ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}