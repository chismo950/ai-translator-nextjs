"use client"

import { useLanguage } from "@/hooks/useLanguage"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t mt-16 py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          {t('app.title')} - Powered by {" "}
          <a href="https://english-dictionary.app" target="_blank">English-Dictionary.app</a>
        </p>
        <p className="mt-2">{t('footer.tagline')}</p>
      </div>
    </footer>
  )
}

