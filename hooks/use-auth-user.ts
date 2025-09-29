"use client"

import { useAuth } from "@/contexts/auth-context"

// This hook is now a simple wrapper around the auth context
// to maintain backward compatibility with existing code
export function useAuthUser() {
  return useAuth()
}
