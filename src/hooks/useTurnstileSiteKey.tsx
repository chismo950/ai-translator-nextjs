"use client"

import useSWR from "swr"
import { getTurnstileSiteKey } from "@/lib/apiClient"

export function useTurnstileSiteKey() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/_turnstile/sitekey",
    () => getTurnstileSiteKey(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  )

  return {
    siteKey: data?.siteKey ?? "",
    headerName: data?.headerName ?? "CF-Turnstile-Token",
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

