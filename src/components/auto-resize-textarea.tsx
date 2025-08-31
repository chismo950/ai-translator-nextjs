"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { TRANSLATION_CONFIG } from "@/lib/config"

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, minRows = TRANSLATION_CONFIG.TEXTAREA.MIN_ROWS, maxRows = TRANSLATION_CONFIG.TEXTAREA.MAX_ROWS, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const combinedRef = ref || textareaRef

  const adjustHeight = React.useCallback(() => {
    const textarea = typeof combinedRef === 'function' ? null : combinedRef?.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate the height based on content
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20
    const minHeight = lineHeight * minRows
    const maxHeight = lineHeight * maxRows

    const contentHeight = textarea.scrollHeight
    const newHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight)

    textarea.style.height = `${newHeight}px`

    // Enable/disable scrolling based on content height
    if (contentHeight > maxHeight) {
      textarea.style.overflowY = 'auto'
    } else {
      textarea.style.overflowY = 'hidden'
    }
  }, [combinedRef, minRows, maxRows])

  useEffect(() => {
    adjustHeight()
  }, [props.value, adjustHeight])

  return (
    <Textarea
      ref={combinedRef}
      className={cn("resize-none", className)}
      onInput={adjustHeight}
      {...props}
    />
  )
})

AutoResizeTextarea.displayName = "AutoResizeTextarea"
