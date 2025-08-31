"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface CharacterCounterProps {
  current: number
  max: number
  softLimit?: number
  className?: string
}

export function CharacterCounter({
  current,
  max,
  softLimit = max * 0.8,
  className = ""
}: CharacterCounterProps) {
  const isNearLimit = current >= softLimit
  const isOverLimit = current > max

  const getVariant = () => {
    if (isOverLimit) return "destructive"
    if (isNearLimit) return "secondary"
    return "outline"
  }

  return (
    <Badge
      variant={getVariant()}
      className={`text-xs ${className}`}
    >
      {current} / {max}
    </Badge>
  )
}
