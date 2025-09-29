"use client"

import type React from "react"

import { useState } from "react"
import { getFirebaseAuth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Dynamically import the InstallButton component with no SSR and delayed loading
const InstallButton = dynamic(() => import("./install-button"), { 
  ssr: false,
  loading: () => <div className="h-8" /> // Placeholder while loading
})

export default function AuthForm({ className }: { className?: string }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot-password">("sign-in")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("Form submitted with mode:", mode);
    console.log("Email:", email);
    
    setLoading(true)
    setError(null)
    const auth = getFirebaseAuth()
    try {
      if (mode === "sign-in") {
        console.log("Signing in user...");
        await signInWithEmailAndPassword(auth, email, password)
      } else if (mode === "sign-up") {
        console.log("Creating new user...");
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() })
        }
      } else if (mode === "forgot-password") {
        console.log("Processing forgot password request...");
        // Use our API route instead of directly calling the email function
        try {
          // Validate email format
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Please enter a valid email address");
          }
          
          console.log("Sending password reset request to API for:", email);
          
          const response = await fetch("/api/send-password-reset", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || "Failed to send password reset email");
          }
          
          console.log("Password reset email sent successfully");
          toast.success("Password reset email sent! Check your inbox.");
          setMode("sign-in");
        } catch (err: any) {
          console.error("Error sending password reset email:", err);
          setError(err?.message || "Failed to send password reset email. Please try again.");
          toast.error(err?.message || "Failed to send password reset email. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err?.message || "Something went wrong")
      toast.error(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("bg-card border-border text-foreground", className)}>
      <CardHeader>
        <CardTitle className="text-pretty">
          {mode === "sign-in" ? "Sign in to Taskly" : mode === "sign-up" ? "Create your Taskly account" : "Reset your password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {mode === "sign-up" && (
            <div className="grid gap-2">
              <label className="text-sm">Name</label>
              <Input
                className="bg-background border-border"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-sm">Email</label>
            <Input
              className="bg-background border-border"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          {mode !== "forgot-password" && (
            <div className="grid gap-2">
              <label className="text-sm">Password</label>
              <Input
                className="bg-background border-border"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={mode === "sign-in" || mode === "sign-up"}
                disabled={mode !== "sign-in" && mode !== "sign-up"}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading}>
            {loading ? "Please wait..." : 
              mode === "sign-in" ? "Sign in" : 
              mode === "sign-up" ? "Create account" : 
              "Send reset link"
            }
          </Button>
          
          {mode === "sign-in" && (
            <button
              type="button"
              className="text-sm underline opacity-80"
              onClick={() => setMode("forgot-password")}
            >
              Forgot password?
            </button>
          )}
          
          {mode === "forgot-password" ? (
            <button
              type="button"
              className="text-sm underline opacity-80"
              onClick={() => setMode("sign-in")}
            >
              Back to Sign In
            </button>
          ) : (
            <button
              type="button"
              className="text-sm underline opacity-80"
              onClick={() => setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"))}
            >
              {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <InstallButton />
      </CardFooter>
    </Card>
  )
}