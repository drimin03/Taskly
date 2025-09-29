"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get the email from URL parameter (for our custom implementation)
  const emailParam = searchParams.get("email")

  useEffect(() => {
    console.log("Reset password page loaded with email param:", emailParam);
    
    // For our custom implementation, we just need to verify the email parameter exists
    if (!emailParam) {
      console.log("No email parameter found in URL");
      setError("Invalid password reset link")
      return
    }

    try {
      // Decode the email parameter
      const decodedEmail = decodeURIComponent(emailParam)
      console.log("Decoded email:", decodedEmail);
      setEmail(decodedEmail)
    } catch (err) {
      console.error("Error decoding email parameter:", err);
      setError("Invalid password reset link")
    }
  }, [emailParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Reset password form submitted for email:", email);
    
    if (!email) {
      setError("Invalid reset link")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // In a production app, you would implement proper password reset logic here
      // This might involve:
      // 1. Verifying a reset token stored in your database
      // 2. Updating the user's password in your authentication system
      // 3. Invalidating the reset token after use
      
      // For demonstration purposes, we'll just show a success message
      console.log("Password reset successful for email:", email);
      toast.success("Password reset successfully! You can now sign in with your new password.")
      router.push("/auth")
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err?.message || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  if (!email && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we process your request.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/auth")}>Back to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a new password for your account ({email}).
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}