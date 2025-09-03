"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { ArrowLeftRight, Copy, Trash2, Clipboard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { useToast } from "@/hooks/use-toast"
import { useTurnstile } from "@/hooks/useTurnstile"
import { useLanguage } from "@/hooks/useLanguage"
import { getTurnstileSiteKey, postTranslate, getPass, TranslationResponse } from "@/lib/apiClient"
import { TRANSLATION_CONFIG } from "@/lib/config"
import { LanguageSelector } from "./language-selector"
import { translationLanguages } from "@/lib/translation-languages"
import { CharacterCounter } from "./character-counter"
import { AutoResizeTextarea } from "./auto-resize-textarea"
import { useTheme } from "next-themes"

const MAX_CHARACTERS = TRANSLATION_CONFIG.MAX_CHARACTERS
const SOFT_LIMIT = TRANSLATION_CONFIG.SOFT_LIMIT

export function Translator() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Translation state
  const [sourceText, setSourceText] = useState("")
  const [targetText, setTargetText] = useState("")
  const [sourceLang, setSourceLang] = useState("auto")
  const [targetLang, setTargetLang] = useState("en-US")
  const [isTranslating, setIsTranslating] = useState(false)

  // Turnstile state
  const [siteKey, setSiteKey] = useState("")
  const [headerName, setHeaderName] = useState("CF-Turnstile-Token")
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [mustVerify, setMustVerify] = useState(false)

  const { containerRef, render, refresh, token, ready, loading, isVerified } = useTurnstile()

  // Local storage keys
  const STORAGE_KEYS = React.useMemo(() => ({
    source: "translator_source_lang",
    target: "translator_target_lang",
  }), [])

  const isValidLang = useCallback((code: string): boolean => {
    return Object.prototype.hasOwnProperty.call(translationLanguages, code)
  }, [])

  // Legacy generic -> region code migration
  const migrateLegacyCode = useCallback((code: string): string => {
    const map: Record<string, string> = {
      // Normalize to current keys
      // English + variants (keep regions)
      en: "en-US",
      "en_us": "en-US",
      // Chinese (keep regions)
      zh: "zh-CN",
      // Spanish (keep regions)
      es: "es-ES",
      // Portuguese (keep regions)
      pt: "pt-PT",
      // Norwegian now uses base language code
      "nb-NO": "no",
      // Collapse region where not needed
      de: "de",
      "de-DE": "de",
      it: "it",
      "it-IT": "it",
      ja: "ja",
      "ja-JP": "ja",
      ko: "ko",
      "ko-KR": "ko",
      ru: "ru",
      "ru-RU": "ru",
      sv: "sv",
      "sv-SE": "sv",
      tr: "tr",
      "tr-TR": "tr",
      uk: "uk",
      "uk-UA": "uk",
      vi: "vi",
      "vi-VN": "vi",
      pl: "pl",
      "pl-PL": "pl",
      ro: "ro",
      "ro-RO": "ro",
      sk: "sk",
      "sk-SK": "sk",
      fi: "fi",
      "fi-FI": "fi",
      el: "el",
      "el-GR": "el",
      he: "he",
      "he-IL": "he",
      hi: "hi",
      "hi-IN": "hi",
      hu: "hu",
      "hu-HU": "hu",
      id: "id",
      "id-ID": "id",
      ms: "ms",
      "ms-MY": "ms",
      nl: "nl",
      "nl-NL": "nl",
      da: "da",
      "da-DK": "da",
      cs: "cs",
      "cs-CZ": "cs",
      hr: "hr",
      "hr-HR": "hr",
      ca: "ca",
      "ca-ES": "ca",
      ar: "ar",
      "ar-SA": "ar",
      // French keeps regions
      fr: "fr-FR",
      // Explicit keeps as-is for regional variants that still exist
      "fr-FR": "fr-FR",
      "fr-CA": "fr-CA",
      "pt-PT": "pt-PT",
      "pt-BR": "pt-BR",
      "es-ES": "es-ES",
      "es-MX": "es-MX",
      "zh-CN": "zh-CN",
      "zh-TW": "zh-TW",
      "en-US": "en-US",
      "en-GB": "en-GB",
      "en-CA": "en-CA",
      "en-AU": "en-AU",
    }
    return map[code] || code
  }, [])

  // Load persisted language selections
  useEffect(() => {
    try {
      let savedSource = localStorage.getItem(STORAGE_KEYS.source)
      let savedTarget = localStorage.getItem(STORAGE_KEYS.target)

      if (savedSource) {
        if (savedSource !== "auto") savedSource = migrateLegacyCode(savedSource)
        if (savedSource === "auto" || isValidLang(savedSource)) {
          setSourceLang(savedSource)
        }
      }
      if (savedTarget) {
        savedTarget = migrateLegacyCode(savedTarget)
        if (isValidLang(savedTarget)) {
          setTargetLang(savedTarget)
        }
      }
    } catch {
      // ignore storage errors (e.g., SSR or privacy mode)
    }
  }, [STORAGE_KEYS.source, STORAGE_KEYS.target, isValidLang, migrateLegacyCode])

  // Persist language selections
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.source, sourceLang)
      if (isValidLang(targetLang)) {
        localStorage.setItem(STORAGE_KEYS.target, targetLang)
      }
    } catch {
      // ignore storage errors
    }
  }, [sourceLang, targetLang, STORAGE_KEYS.source, STORAGE_KEYS.target, isValidLang])

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
        description: t('error.empty'),
        variant: "destructive",
      })
      return
    }

    if (sourceText.length > MAX_CHARACTERS) {
      toast({
        title: t('character.limit'),
        description: t('character.limit'),
        variant: "destructive",
      })
      return
    }

    // If source and target languages are the same, no API call needed
    if (sourceLang !== "auto" && sourceLang === targetLang) {
      setTargetText(sourceText)
      return
    }

    // Check if we need Turnstile verification
    const hasPass = getPass()
    if (!hasPass && !token) {
      setShowTurnstile(true)
      setMustVerify(true)
      toast({
        title: t('turnstile.verify'),
        description: t('turnstile.verify'),
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

    } catch (error) {
      console.error("Translation error:", error)

      // Show Turnstile if verification failed
      if (error instanceof Error && (error.message.includes("400") || error.message.includes("403"))) {
        setShowTurnstile(true)
        setMustVerify(true)
        refresh()
        toast({
          title: t('error.turnstile'),
          description: t('turnstile.verify'),
          variant: "destructive",
        })
      } else {
        toast({
          title: t('error.generic'),
          description: error instanceof Error ? error.message : "Translation failed",
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
        title: t('toast.copied.title'),
        description: type === 'source' ? t('toast.copied.source') : t('toast.copied.target'),
      })
    } catch {
      toast({
        title: t('toast.copyFailed.title'),
        description: t('toast.copyFailed.desc'),
        variant: "destructive",
      })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setSourceText(text)
      toast({
        title: t('toast.pasted.title'),
        description: t('toast.pasted.desc'),
      })
    } catch {
      toast({
        title: t('toast.pasteFailed.title'),
        description: t('toast.pasteFailed.desc'),
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
    <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Language Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-6 lg:items-center">
        <div className="flex justify-center lg:justify-end">
          <LanguageSelector
            value={sourceLang}
            onChange={setSourceLang}
            placeholder={t('language.source')}
            options={translationLanguages}
            allowDetect
          />
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapLanguages}
            disabled={sourceLang === "auto" || isTranslating}
            className="shrink-0"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center lg:justify-start">
          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            placeholder={t('language.target')}
            options={translationLanguages}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
            minRows={TRANSLATION_CONFIG.TEXTAREA.MIN_ROWS}
            maxRows={TRANSLATION_CONFIG.TEXTAREA.MAX_ROWS}
            className="border-0 p-3 focus-visible:ring-0 text-base resize-none"
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
            minRows={TRANSLATION_CONFIG.TEXTAREA.MIN_ROWS}
            maxRows={TRANSLATION_CONFIG.TEXTAREA.MAX_ROWS}
            className="border-0 p-3 focus-visible:ring-0 text-base resize-none bg-transparent"
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
