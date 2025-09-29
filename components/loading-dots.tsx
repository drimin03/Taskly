import { cn } from "@/lib/utils"

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span className="animate-pulse">●</span>
      <span className="animate-pulse delay-100">●</span>
      <span className="animate-pulse delay-200">●</span>
    </span>
  )
}