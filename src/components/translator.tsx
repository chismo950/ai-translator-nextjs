"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { ArrowLeftRight, Copy, Trash2, Clipboard, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useTurnstile } from "@/hooks/useTurnstile"
import { useLanguage } from "@/hooks/useLanguage"
import { getTurnstileSiteKey, postTranslate, getPass, TranslationResponse } from "@/lib/apiClient"
import { LanguageSelector } from "./language-selector"
import { CharacterCounter } from "./character-counter"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { useTheme } from "next-themes"

const MAX_CHARACTERS = 5000
const SOFT_LIMIT = 4000

export function Translator() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Translation state
  const [sourceText, setSourceText] = useState("")
  const [targetText, setTargetText] = useState("")
  const [sourceLang, setSourceLang] = useState("auto")
  const [targetLang, setTargetLang] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)

  // Turnstile state
  const [siteKey, setSiteKey] = useState("")
  const [headerName, setHeaderName] = useState("CF-Turnstile-Token")
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [mustVerify, setMustVerify] = useState(false)

  const { containerRef, render, refresh, token, ready, loading, isVerified } = useTurnstile()

  // Fetch Turnstile site key
  useEffect(() => {
    getTurnstileSiteKey()
      .then((data) => {
        setSiteKey(data.siteKey)
        setHeaderName(data.headerName || "CF-Turnstile-Token")
      })
      .catch(() => {
        setSiteKey("")
        setHeaderName("CF-Turnstile-Token")
      })
  }, [])

  // Render Turnstile when needed
  useEffect(() => {
    if (siteKey && showTurnstile && !ready) {
      render(siteKey, theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto')
    }
  }, [siteKey, showTurnstile, ready, render, theme])

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      toast({
        title: t('error.generic'),
        description: "Please enter text to translate",
        variant: "destructive",
      })
      return
    }

    if (sourceText.length > MAX_CHARACTERS) {
      toast({
        title: t('character.limit'),
        description: `Text exceeds ${MAX_CHARACTERS} characters`,
        variant: "destructive",
      })
      return
    }

    // Check if we need Turnstile verification
    const hasPass = getPass()
    if (!hasPass && !token) {
      setShowTurnstile(true)
      setMustVerify(true)
      toast({
        title: t('turnstile.verify'),
        description: "Please complete the verification to continue",
      })
      return
    }

    setIsTranslating(true)
    setTargetText("")

    try {
      const response: TranslationResponse = await postTranslate(
        {
          text: sourceText,
          sourceLang: sourceLang === "auto" ? null : sourceLang,
          targetLang,
        },
        {
          turnstileHeaderName: headerName,
          getTurnstileToken: () => token,
        }
      )

      setTargetText(response.translatedText || "")

      // Hide Turnstile after successful translation with pass
      if (getPass()) {
        setShowTurnstile(false)
        setMustVerify(false)
      } else {
        // Refresh Turnstile for next use if no pass
        refresh()
      }

    } catch (error: any) {
      console.error("Translation error:", error)

      // Show Turnstile if verification failed
      if (error.message.includes("400") || error.message.includes("403")) {
        setShowTurnstile(true)
        setMustVerify(true)
        refresh()
        toast({
          title: t('error.turnstile'),
          description: "Please verify again to continue",
          variant: "destructive",
        })
      } else {
        toast({
          title: t('error.generic'),
          description: error.message || "Translation failed",
          variant: "destructive",
        })
      }
    } finally {
      setIsTranslating(false)
    }
  }, [sourceText, sourceLang, targetLang, token, headerName, t, toast, refresh])

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") return

    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(targetText)
    setTargetText(sourceText)
  }

  const handleCopy = async (text: string, type: 'source' | 'target') => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${type === 'source' ? 'Source' : 'Translation'} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setSourceText(text)
      toast({
        title: "Pasted!",
        description: "Text pasted from clipboard",
      })
    } catch (error) {
      toast({
        title: "Paste failed",
        description: "Failed to paste from clipboard",
        variant: "destructive",
      })
    }
  }

  const handleClear = () => {
    setSourceText("")
    setTargetText("")
  }

  // Show Turnstile on first load or when required
  useEffect(() => {
    if (!getPass() && siteKey) {
      setShowTurnstile(true)
    }
  }, [siteKey])

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Language Selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <LanguageSelector
          value={sourceLang}
          onChange={setSourceLang}
          placeholder={t('language.source')}
          allowDetect
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapLanguages}
          disabled={sourceLang === "auto" || isTranslating}
          className="shrink-0"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <LanguageSelector
          value={targetLang}
          onChange={setTargetLang}
          placeholder={t('language.target')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Text */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {sourceLang === "auto" ? t('language.detect') : t('language.source')}
            </h3>
            <div className="flex items-center gap-1">
              <CharacterCounter
                current={sourceText.length}
                max={MAX_CHARACTERS}
                softLimit={SOFT_LIMIT}
              />
            </div>
          </div>

          <AutoResizeTextarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={t('input.placeholder')}
            maxLength={MAX_CHARACTERS}
            minRows={4}
            maxRows={12}
            className="border-0 p-0 focus-visible:ring-0 text-base resize-none"
          />

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              disabled={isTranslating}
            >
              <Clipboard className="h-4 w-4 mr-1" />
              {t('input.paste')}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(sourceText, 'source')}
              disabled={!sourceText || isTranslating}
            >
              <Copy className="h-4 w-4 mr-1" />
              {t('input.copy')}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!sourceText || isTranslating}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('input.clear')}
            </Button>
          </div>
        </Card>

        {/* Target Text */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('language.target')}
            </h3>
          </div>

          <AutoResizeTextarea
            value={targetText}
            placeholder={t('output.placeholder')}
            readOnly
            minRows={4}
            maxRows={12}
            className="border-0 p-0 focus-visible:ring-0 text-base resize-none bg-transparent"
          />

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(targetText, 'target')}
              disabled={!targetText}
            >
              <Copy className="h-4 w-4 mr-1" />
              {t('output.copy')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Translation Section with Turnstile */}
      <div className="flex flex-col items-center gap-4">
        {/* Turnstile Widget */}
        {showTurnstile && (
          <div className="flex flex-col items-center gap-2">
            <div ref={containerRef} />
            {mustVerify && (
              <p className="text-sm text-muted-foreground text-center">
                {loading ? t('turnstile.verifying') : t('turnstile.verify')}
              </p>
            )}
          </div>
        )}

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim() || (showTurnstile && !isVerified)}
          size="lg"
          className="min-w-[200px]"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('turnstile.verifying')}
            </>
          ) : (
            t('button.translate')
          )}
        </Button>
      </div>
    </div>
  )
}
