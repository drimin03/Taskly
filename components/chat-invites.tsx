"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUsers } from "@/hooks/use-users"
import { useInvites, type Invite, roomIdFor } from "@/hooks/use-invites"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IoPersonAdd, IoChatbubbles, IoCheckmark, IoClose, IoPerson, IoChatbox } from "react-icons/io5"
import { Skeleton } from "@/components/ui/skeleton"


export function ChatInvites() {
  const { user, usersPresence } = useAuth()
  const { users, loading: usersLoading } = useUsers(user, usersPresence)
  const { incoming: invites, outgoing: sentInvites, sendInvite, acceptInvite, rejectInvite, loading: invitesLoading } = useInvites(user?.uid || null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  async function handleInvite(userId: string) {
    if (!user?.uid) return
    try {
      setSelectedUser(userId) // Set selected user immediately for instant feedback
      await sendInvite(userId)
      // No need to reset selectedUser as we want to show the user is already invited
    } catch (e) {
      console.error("Failed to send invite", e)
      setSelectedUser(null) // Reset on error
    }
  }

  async function handleAccept(invite: Invite) {
    try {
      const roomId = await acceptInvite(invite)
      router.refresh()
      // Redirect to the chat room after accepting the invite
      if (roomId) {
        router.push(`/chats/${roomId}`)
      }
    } catch (e) {
      console.error("Failed to accept invite", e)
    }
  }

  async function handleReject(inviteId: string) {
    try {
      await rejectInvite(inviteId)
    } catch (e) {
      console.error("Failed to reject invite", e)
    }
  }

  // Get users with whom we have accepted chats
  const chatPartners: Array<{ 
    uid: string; 
    displayName: string; 
    email: string; 
    photoURL: string; 
    inviteId: string 
  }> = [...invites, ...sentInvites]
    .filter(invite => invite.status === "accepted")
    .map(invite => {
      const otherUser = invite.fromUid === user?.uid ? invite.toUser : invite.fromUser;
      return otherUser ? { ...otherUser, inviteId: invite.id } : null;
    })
    .filter(Boolean) as any;

  // Show all users except the current user
  const availableUsers = users.filter(u => u.uid !== user?.uid);

  // Combine pending invites (both incoming and outgoing)
  const pendingInvites = [...invites.filter(i => i.status === "pending"), ...sentInvites.filter(i => i.status === "pending")];

  return (
    <div className="space-y-6">
      {/* Invitations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Pending chat invitations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitesLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingInvites.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => {
                const isIncoming = invite.toUid === user?.uid;
                const userToShow = isIncoming ? invite.fromUser : invite.toUser;
                
                return (
                  <div key={invite.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userToShow?.photoURL || undefined} />
                        <AvatarFallback>
                          {userToShow?.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {userToShow?.displayName || userToShow?.email || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isIncoming ? "Incoming invite" : "Sent invite"}
                        </p>
                      </div>
                    </div>
                    {isIncoming ? (
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="default"
                          onClick={() => handleAccept(invite)}
                        >
                          <IoCheckmark className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleReject(invite.id)}
                        >
                          <IoClose className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Connect with other users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {availableUsers.map((u) => {
                // Check if there's a pending invite with this user
                const pendingInvite = [...invites, ...sentInvites].find(invite => 
                  invite.status === "pending" && 
                  (invite.fromUid === u.uid || invite.toUid === u.uid) &&
                  (invite.fromUid === user?.uid || invite.toUid === user?.uid)
                );
                
                // Check if there's an accepted invite with this user
                const acceptedInvite = [...invites, ...sentInvites].find(invite => 
                  invite.status === "accepted" && 
                  (invite.fromUid === u.uid || invite.toUid === u.uid) &&
                  (invite.fromUid === user?.uid || invite.toUid === user?.uid)
                );
                
                return (
                  <div key={u.uid} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={u.photoURL || undefined} />
                          <AvatarFallback>
                            {u.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Only render presence indicator on client */}
                        {isClient && usersPresence && u.uid && usersPresence[u.uid] === true && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{u.displayName || u.email || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {isClient && usersPresence && u.uid && usersPresence[u.uid] === true ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                    {acceptedInvite ? (
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (acceptedInvite) {
                              const roomId = roomIdFor(acceptedInvite.fromUid, acceptedInvite.toUid);
                              router.push(`/chats/${roomId}`);
                            }
                          }}
                        >
                          <IoChatbox className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                        {/* Removed unread message badge */}
                      </div>
                    ) : pendingInvite ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <IoPersonAdd className="mr-2 h-4 w-4" />
                        Pending
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInvite(u.uid)}
                        disabled={selectedUser === u.uid}
                      >
                        {selectedUser === u.uid ? (
                          <>
                            <IoCheckmark className="mr-2 h-4 w-4" />
                            Invited
                          </>
                        ) : (
                          <>
                            <IoPersonAdd className="mr-2 h-4 w-4" />
                            Invite
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}