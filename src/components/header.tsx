"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useLanguage } from "@/hooks/useLanguage"
import { LanguageSelector } from "./language-selector"
import { SupportedLanguage, uiLanguages } from "@/lib/i18n"


export function Header() {
  const { currentLanguage, setCurrentLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left section - Logo and title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-[60%] lg:max-w-[70%]">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold truncate">{t('app.title')}</h1>
          </div>
          <div className="hidden xl:block text-sm text-muted-foreground truncate">
            {t('app.description')}
          </div>
        </div>

        {/* Right section - Controls */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Mobile: Compact language selector */}
          <div className="md:hidden">
            <LanguageSelector
              value={currentLanguage}
              onChange={(value) => setCurrentLanguage(value as SupportedLanguage)}
              placeholder="Lang"
              options={uiLanguages}
              compact
            />
          </div>

          {/* Medium screens: Language selector without label */}
          <div className="hidden md:block lg:hidden">
            <LanguageSelector
              value={currentLanguage}
              onChange={(value) => setCurrentLanguage(value as SupportedLanguage)}
              placeholder="Language"
              options={uiLanguages}
              compact
            />
          </div>

          {/* Large screens: Full language selector with label */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Language:</span>
            <div className="min-w-[120px] max-w-[160px]">
              <LanguageSelector
                value={currentLanguage}
                onChange={(value) => setCurrentLanguage(value as SupportedLanguage)}
                placeholder="Language"
                options={uiLanguages}
              />
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
