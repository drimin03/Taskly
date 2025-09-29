"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure we're on the client
    setIsClient(true)
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // For iOS devices, show install instructions
    if (isIOSDevice) {
      // Check if already installed (iOS doesn't have a reliable way to detect this)
      // We'll assume it's installable for iOS users
      setIsInstallable(true)
      return
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show the install button
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  const handleInstallClick = async () => {
    // For iOS devices, show instructions
    if (isIOS) {
      // Show instructions for iOS users
      alert('To install this app on your iOS device:\n\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"')
      return
    }

    // For Android/other devices, use the standard install prompt
    if (!deferredPrompt) return

    // Show the install prompt
    await deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    // Clear the deferredPrompt variable
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // Don't render anything on the server
  if (!isClient) return null

  if (!isInstallable || isInstalled) return null

  return (
    <Button 
      onClick={handleInstallClick} 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
    >
      <Download size={16} />
      <span>{isIOS ? 'Install App' : 'Install App'}</span>
    </Button>
  )
}