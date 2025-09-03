"use client"

import { Header } from "@/components/header";
import { Translator } from "@/components/translator";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <Translator />
      </main>
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('app.title')} - Powered by <a href="https://english-dictionary.app" target="_blank">English-Dictionary.app</a></p>
          <p className="mt-2">{t('footer.tagline')}</p>
        </div>
      </footer>
    </div>
  );
}
