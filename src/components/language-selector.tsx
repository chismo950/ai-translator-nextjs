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
import { languages, SupportedLanguage } from "@/lib/i18n"

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowDetect?: boolean
  disabled?: boolean
}

export function LanguageSelector({
  value,
  onChange,
  placeholder = "Select language",
  allowDetect = false,
  disabled = false
}: LanguageSelectorProps) {
  const getDisplayText = () => {
    if (!value) return placeholder
    if (value === "auto" && allowDetect) return "Detect language"
    return languages[value as SupportedLanguage] || value
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between min-w-[140px]"
          disabled={disabled}
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
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
        {Object.entries(languages).map(([code, name]) => (
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
