"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Clipboard, Copy, Loader2, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { AutoResizeTextarea } from "@/components/auto-resize-textarea"
import { CharacterCounter } from "@/components/character-counter"
import { LanguageSelector } from "@/components/language-selector"

import { useToast } from "@/hooks/use-toast"
import { useTurnstile } from "@/hooks/useTurnstile"
import { useLanguage } from "@/hooks/useLanguage"

import { getTurnstileSiteKey, getPass, postTranslate, TranslationResponse } from "@/lib/apiClient"
import { TRANSLATION_CONFIG } from "@/lib/config"
import { translationLanguages } from "@/lib/translation-languages"

const MAX_CHARACTERS = TRANSLATION_CONFIG.MAX_CHARACTERS
const SOFT_LIMIT = TRANSLATION_CONFIG.SOFT_LIMIT

export function BatchTranslator() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { theme } = useTheme()

  // Input state
  const [sourceText, setSourceText] = useState("")
  const [sourceLang, setSourceLang] = useState<string>("auto")
  const [targets, setTargets] = useState<string[]>([])

  // Result state
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  // Turnstile state
  const [siteKey, setSiteKey] = useState("")
  const [headerName, setHeaderName] = useState("CF-Turnstile-Token")
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [mustVerify, setMustVerify] = useState(false)

  const { containerRef, render, refresh, token, ready, loading, isVerified } = useTurnstile()

  // Storage keys (scoped for batch)
  const STORAGE_KEYS = useMemo(() => ({
    source: "batch_source_lang",
    targets: "batch_target_langs",
  }), [])

  const isValidLang = useCallback((code: string) => {
    return Object.prototype.hasOwnProperty.call(translationLanguages, code)
  }, [])

  // Load persisted selections
  useEffect(() => {
    try {
      const savedSource = localStorage.getItem(STORAGE_KEYS.source)
      const savedTargets = localStorage.getItem(STORAGE_KEYS.targets)
      if (savedSource && (savedSource === "auto" || isValidLang(savedSource))) {
        setSourceLang(savedSource)
      }
      if (savedTargets) {
        const parsed: unknown = JSON.parse(savedTargets)
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((c) => typeof c === 'string' && isValidLang(c))
          setTargets(filtered)
        }
      }
    } catch {
      // ignore
    }
  }, [STORAGE_KEYS.source, STORAGE_KEYS.targets, isValidLang])

  // Persist selections
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.source, sourceLang)
      localStorage.setItem(STORAGE_KEYS.targets, JSON.stringify(targets))
    } catch {
      // ignore
    }
  }, [sourceLang, targets, STORAGE_KEYS.source, STORAGE_KEYS.targets])

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

  // Show Turnstile by default if no pass
  useEffect(() => {
    if (!getPass() && siteKey) {
      setShowTurnstile(true)
    }
  }, [siteKey])

  const toggleTarget = (code: string) => {
    setTargets((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code])
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: t('toast.copied.title'), description: t('toast.copied.target') })
    } catch {
      toast({ title: t('toast.copyFailed.title'), description: t('toast.copyFailed.desc'), variant: 'destructive' })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setSourceText(text)
      toast({ title: t('toast.pasted.title'), description: t('toast.pasted.desc') })
    } catch {
      toast({ title: t('toast.pasteFailed.title'), description: t('toast.pasteFailed.desc'), variant: 'destructive' })
    }
  }

  const handleClear = () => {
    setSourceText("")
    setResults({})
  }

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(sourceText)
      toast({ title: t('toast.copied.title'), description: t('toast.copied.source') })
    } catch {
      toast({ title: t('toast.copyFailed.title'), description: t('toast.copyFailed.desc'), variant: 'destructive' })
    }
  }

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      toast({ title: t('error.generic'), description: t('error.empty'), variant: 'destructive' })
      return
    }
    if (sourceText.length > MAX_CHARACTERS) {
      toast({ title: t('character.limit'), description: t('character.limit'), variant: 'destructive' })
      return
    }
    if (targets.length === 0) {
      toast({ title: t('error.generic'), description: t('language.select'), variant: 'destructive' })
      return
    }

    // Ensure verification
    const hasPass = getPass()
    if (!hasPass && !token) {
      setShowTurnstile(true)
      setMustVerify(true)
      toast({ title: t('turnstile.verify'), description: t('turnstile.verify') })
      return
    }

    setIsTranslating(true)
    setResults({})

    try {
      // Translate sequentially so the pass (if issued) applies to subsequent requests
      for (const tl of targets) {
        // If same as explicit source, echo text
        if (sourceLang !== 'auto' && sourceLang === tl) {
          setResults((prev) => ({ ...prev, [tl]: sourceText }))
          continue
        }

        setCurrentTarget(tl)

        const response: TranslationResponse = await postTranslate(
          {
            text: sourceText,
            sourceLang: sourceLang === 'auto' ? null : sourceLang,
            targetLang: tl,
          },
          {
            turnstileHeaderName: headerName,
            getTurnstileToken: () => token,
          }
        )

        setResults((prev) => ({ ...prev, [tl]: response.translatedText || '' }))
      }

      // Hide Turnstile after successful translation if pass is present
      if (getPass()) {
        setShowTurnstile(false)
        setMustVerify(false)
      } else {
        refresh()
      }
    } catch (error) {
      console.error('Batch translation error:', error)

      if (error instanceof Error && (error.message.includes('400') || error.message.includes('403'))) {
        setShowTurnstile(true)
        setMustVerify(true)
        refresh()
        toast({ title: t('error.turnstile'), description: t('turnstile.verify'), variant: 'destructive' })
      } else {
        toast({ title: t('error.generic'), description: error instanceof Error ? error.message : 'Translation failed', variant: 'destructive' })
      }
    } finally {
      setCurrentTarget(null)
      setIsTranslating(false)
    }
  }, [sourceText, sourceLang, targets, token, headerName, t, toast, refresh])

  const selectedCount = targets.length

  return (
    <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Language selection row */}
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

        <div className="hidden lg:flex justify-center">
          {/* Spacer to mirror home layout */}
        </div>

        <div className="flex justify-center lg:justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between">
                <span className="truncate">
                  {selectedCount === 0
                    ? t('language.select')
                    : `${selectedCount} selected`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-[320px] overflow-y-auto">
              <DropdownMenuLabel>{t('language.target')}</DropdownMenuLabel>
              {Object.entries(translationLanguages).map(([code, name]) => (
                <DropdownMenuCheckboxItem
                  key={code}
                  checked={targets.includes(code)}
                  onCheckedChange={() => toggleTarget(code)}
                  onSelect={(e) => {
                    // keep the dropdown open while selecting multiple targets
                    e.preventDefault()
                  }}
                >
                  {name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Source Text */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {sourceLang === 'auto' ? t('language.detect') : t('language.source')}
            </h3>
            <div className="flex items-center gap-1">
              <CharacterCounter current={sourceText.length} max={MAX_CHARACTERS} softLimit={SOFT_LIMIT} />
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
            <Button variant="ghost" size="sm" onClick={handlePaste} disabled={isTranslating}>
              <Clipboard className="h-4 w-4 mr-1" />
              {t('input.paste')}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleCopySource} disabled={!sourceText || isTranslating}>
              <Copy className="h-4 w-4 mr-1" />
              {t('input.copy')}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleClear} disabled={!sourceText || isTranslating}>
              <Trash2 className="h-4 w-4 mr-1" />
              {t('input.clear')}
            </Button>
          </div>
        </Card>

        {/* Batch Results */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{t('language.target')}</h3>
            {isTranslating && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                {currentTarget || t('turnstile.verifying')}
              </div>
            )}
          </div>

          {targets.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              {t('language.select')}
            </div>
          ) : (
            <div className="space-y-4">
              {targets.map((code, idx) => (
                <div key={code}>
                  {idx > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{translationLanguages[code] || code}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(results[code] || '')}
                      disabled={!(results[code] || '').length}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {t('output.copy')}
                    </Button>
                  </div>

                  <AutoResizeTextarea
                    value={results[code] || ''}
                    placeholder={t('output.placeholder')}
                    readOnly
                    minRows={3}
                    maxRows={TRANSLATION_CONFIG.TEXTAREA.MAX_ROWS}
                    className="border-0 p-3 focus-visible:ring-0 text-base resize-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Translation Section with Turnstile */}
      <div className="flex flex-col items-center gap-4">
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

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim() || targets.length === 0 || (showTurnstile && !isVerified)}
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
