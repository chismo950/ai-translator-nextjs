"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { uiLanguages } from "@/lib/i18n"

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowDetect?: boolean
  disabled?: boolean
  compact?: boolean
  options?: Record<string, string>
}

export function LanguageSelector({
  value,
  onChange,
  placeholder = "Select language",
  allowDetect = false,
  disabled = false,
  compact = false,
  options = uiLanguages,
}: LanguageSelectorProps) {
  const getDisplayText = () => {
    if (!value) return placeholder
    if (value === "auto" && allowDetect) {
      return compact ? "Auto" : "Detect language"
    }
    if (compact) {
      return value.toUpperCase()
    }
    return options[value] || value
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={compact
            ? "justify-between min-w-[80px] max-w-[120px] px-2 h-8 text-xs"
            : "w-full justify-between min-w-[140px]"
          }
          disabled={disabled}
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className={compact ? "h-3 w-3 shrink-0 opacity-50" : "h-4 w-4 shrink-0 opacity-50"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
        {allowDetect && (
          <DropdownMenuItem
            onSelect={() => onChange("auto")}
            className={value === "auto" ? "bg-accent" : ""}
          >
            Detect language
          </DropdownMenuItem>
        )}
        {Object.entries(options).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => onChange(code)}
            className={value === code ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
