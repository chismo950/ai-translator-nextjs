"use client"

import { Header } from "@/components/header";
import { useLanguage } from "@/hooks/useLanguage";
import { BatchTranslator } from "@/components/batch-translator";
import { Footer } from "@/components/footer";

export default function BatchPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <BatchTranslator />
      </main>
      <Footer />
    </div>
  );
}
