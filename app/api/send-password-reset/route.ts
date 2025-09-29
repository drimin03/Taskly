import { sendPasswordResetEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }
    
    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}`
    
    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to send password reset email" },
      { status: 500 }
    )
  }
}