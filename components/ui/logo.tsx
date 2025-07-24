import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl", 
    xl: "text-3xl"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg",
        sizeClasses[size]
      )}>
        <div className="text-white font-bold text-sm">
          {size === "sm" ? "B" : "₿"}
        </div>
      </div>
      
      {/* App Name */}
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent",
          textSizes[size]
        )}>
          Biaz
        </span>
      )}
    </div>
  )
}