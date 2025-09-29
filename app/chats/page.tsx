"use client"

import PageTransition from "@/components/page-transition"
import { BottomNav } from "@/components/bottom-nav"
import { ChatThread } from "@/components/chat-thread"
import { ChatInvites } from "@/components/chat-invites"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useInvites } from "@/hooks/use-invites"
import { useUsers } from "@/hooks/use-users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IoChatbox, IoPerson } from "react-icons/io5"
import { useRouter } from "next/navigation"
import { roomIdFor } from "@/hooks/use-invites"
import { useMemo } from "react"

export default function ChatsPage() {
  const { user, loading, usersPresence } = useAuth()
  const { incoming: invites, outgoing: sentInvites, loading: invitesLoading } = useInvites(user?.uid || null)
  const { users, loading: usersLoading } = useUsers(user, usersPresence)
  const router = useRouter()

  // Get users with whom we have accepted chats
  const chatPartners = useMemo(() => {
    return [...invites, ...sentInvites]
      .filter(invite => invite.status === "accepted")
      .map(invite => {
        const otherUser = invite.fromUid === user?.uid ? invite.toUser : invite.fromUser;
        return otherUser ? { ...otherUser, inviteId: invite.id } : null;
      })
      .filter(Boolean) as { uid: string; displayName: string; email: string; photoURL: string; inviteId: string }[];
  }, [invites, sentInvites, user]);

  // Memoize the loading state
  const loadingState = useMemo(() => (
    <div className="mt-4">
      <p className="text-muted-foreground text-center py-8">Sign in to access chat invites</p>
    </div>
  ), []);

  return (
    <PageTransition>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-pretty text-2xl font-semibold">
            {user ? "Chats" : "Sample Chats"}
          </h1>
          {user && (
            <Link href="/chats/general">
              <Button variant="outline" size="sm">
                General Chat
              </Button>
            </Link>
          )}
        </div>
        <p className="text-muted-foreground">
          {user 
            ? "Message threads and AI assistant." 
            : "Sign in to start chatting with your team."}
        </p>
        
        {user ? (
          <div className="mt-6">
            <Tabs defaultValue="invites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invites" className="flex items-center gap-2">
                  <IoPerson className="text-lg" />
                  Invites
                </TabsTrigger>
                <TabsTrigger value="people" className="flex items-center gap-2">
                  <IoChatbox className="text-lg" />
                  People
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invites" className="space-y-4">
                <ChatInvites />
              </TabsContent>

              <TabsContent value="people" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>People</CardTitle>
                    <CardDescription>Your chat connections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {invitesLoading ? (
                      <div className="text-center text-muted-foreground py-4">
                        Loading connections...
                      </div>
                    ) : chatPartners.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        No chat connections yet. Send an invite to get started!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chatPartners.map((partner) => {
                          // Removed unreadCount logic
                          
                          return (
                            <div key={`chat-${partner.uid}`} className="flex items-center justify-between border rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={partner.photoURL || undefined} />
                                    <AvatarFallback>
                                      {partner.displayName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {usersPresence && partner.uid && usersPresence[partner.uid] === true && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{partner.displayName || partner.email || "Unknown User"}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {usersPresence && partner.uid && usersPresence[partner.uid] === true ? "Online" : "Offline"}
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    // Find the invite to get the room ID
                                    const invite = [...invites, ...sentInvites].find(i => 
                                      i.status === "accepted" && 
                                      (i.fromUid === partner.uid || i.toUid === partner.uid)
                                    );
                                    if (invite) {
                                      const roomId = roomIdFor(invite.fromUid, invite.toUid);
                                      router.push(`/chats/${roomId}`);
                                    }
                                  }}
                                >
                                  <div className="flex items-center">
                                    <IoChatbox className="mr-2 h-4 w-4" />
                                    Chat
                                  </div>
                                </Button>
                                {/* Removed unread message badge */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          loadingState
        )}
      </main>
      <BottomNav />
    </PageTransition>
  )
}