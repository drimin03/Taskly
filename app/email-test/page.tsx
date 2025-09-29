"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function EmailTestPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null)

  const handleTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `Email sent successfully! Check your inbox for: ${email}` })
        toast.success("Email sent successfully!")
      } else {
        setResult({ success: false, message: `Failed to send email: ${data.error}` })
        toast.error(data.error || "Failed to send email")
      }
    } catch (error: any) {
      console.error("Error sending test email:", error)
      setResult({ success: false, message: `Error: ${error.message}` })
      toast.error("Error sending email: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Functionality Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use this page to test if the email functionality is working correctly.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          
          <Button 
            onClick={handleTestEmail} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
          
          {result && (
            <div className={`p-3 rounded-md text-sm ${
              result.success 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {result.message}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Troubleshooting tips:</strong></p>
            <p>1. Check your spam/junk folder</p>
            <p>2. Make sure you're using a Gmail App Password</p>
            <p>3. Verify environment variables are set correctly</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}