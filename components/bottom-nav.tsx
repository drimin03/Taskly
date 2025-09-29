"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderKanban, MessageCircle, BarChart2, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Dynamically import the InstallButton component with no SSR and delayed loading
const InstallButton = dynamic(() => import("./install-button"), { 
  ssr: false,
  loading: () => <div className="h-8 w-24" /> // Placeholder while loading
})

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/insights", label: "Insights", icon: BarChart2 },
  { href: "/profile", label: "Profile", icon: User2 },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on the server
  if (!isClient) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden"
      role="navigation"
      aria-label="Primary"
    >
      <div className="relative">
        {/* <div>
          <InstallButton />
        </div> */}
      </div>
      <ul className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href))
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-md px-2 py-1 text-xs",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {/* Removed unread message badge */}
                </div>
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav