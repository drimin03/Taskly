"use client"

import dynamic from "next/dynamic"

const DynamicBottomNav = dynamic(() => import("@/components/bottom-nav"), { ssr: false })

export default function ClientBottomNav() {
  return <DynamicBottomNav />
}