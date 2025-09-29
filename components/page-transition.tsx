"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type React from "react"
import { useState, useEffect } from "react"
import LoadingScreen from "./loading-screen"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isChangingPage, setIsChangingPage] = useState(false)
  
  // Track page changes to show loading screen with optimized timing
  useEffect(() => {
    setIsChangingPage(true)
    // Reset after a very short delay for smoother transitions
    const timer = setTimeout(() => {
      setIsChangingPage(false)
    }, 10) // Further reduced from 50ms to 10ms for faster transitions
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {isChangingPage && <LoadingScreen />}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05, ease: "easeInOut" }} // Further reduced duration for faster transitions
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}