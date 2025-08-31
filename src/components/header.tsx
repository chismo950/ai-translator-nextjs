"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useLanguage } from "@/hooks/useLanguage"
import { LanguageSelector } from "./language-selector"
import { languages } from "@/lib/i18n"

export function Header() {
  const { currentLanguage, setCurrentLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{t('app.title')}</h1>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">
            {t('app.description')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Language:</span>
            <LanguageSelector
              value={currentLanguage}
              onChange={(value) => setCurrentLanguage(value as any)}
              placeholder="Language"
            />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
