"use client";

import { useState, useEffect, useCallback } from "react";
import { getFallbackMicrocopy } from "@/lib/ai/fallbacks";
import type { MicrocopyContext, MicrocopyTone } from "@/types/ai";

interface MicrocopyResult {
  message: string;
  tone: MicrocopyTone;
  isLoading: boolean;
}

interface MicrocopyUserData {
  name?: string;
  mood?: number;
  energy?: number;
}

export function useMicrocopy(
  context: MicrocopyContext,
  userData?: MicrocopyUserData
): MicrocopyResult {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<MicrocopyTone>("gentle");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMicrocopy = useCallback(() => {
    setIsLoading(true);

    // Small delay to feel natural, then use fallback
    // In the future, this can call an AI API endpoint
    const timer = setTimeout(() => {
      try {
        const fallback = getFallbackMicrocopy(context);
        setMessage(fallback.message);
        setTone(fallback.tone);
      } catch {
        setMessage("Você está aqui. Isso importa.");
        setTone("gentle");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [context]);

  useEffect(() => {
    const cleanup = fetchMicrocopy();
    return cleanup;
  }, [fetchMicrocopy]);

  return { message, tone, isLoading };
}
