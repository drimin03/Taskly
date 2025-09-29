"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function Preferences() {
  const [notif, setNotif] = useState(true)
  const [aiHints, setAiHints] = useState(true)

  useEffect(() => {
    try {
      const n = localStorage.getItem("pref_notif")
      const a = localStorage.getItem("pref_aihints")
      if (n) setNotif(n === "1")
      if (a) setAiHints(a === "1")
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("pref_notif", notif ? "1" : "0")
      localStorage.setItem("pref_aihints", aiHints ? "1" : "0")
    } catch {}
  }, [notif, aiHints])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
        <div>
          <Label className="text-sm">Notifications</Label>
          <p className="text-xs text-muted-foreground">Receive task reminders</p>
        </div>
        <Switch checked={notif} onCheckedChange={setNotif} aria-label="Toggle notifications" />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
        <div>
          <Label className="text-sm">AI Hints</Label>
          <p className="text-xs text-muted-foreground">Suggest tasks from chats</p>
        </div>
        <Switch checked={aiHints} onCheckedChange={setAiHints} aria-label="Toggle AI hints" />
      </div>
    </div>
  )
}
