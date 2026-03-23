// ============================================================
// AI Provider abstraction for Ancora
// Decoupled architecture: swap Gemini for any provider later
// ============================================================

export interface AIProvider {
  generate(prompt: string, systemPrompt: string): Promise<string>;
}

// --------------- Gemini Provider ---------------

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;

export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.callGemini(prompt, systemPrompt);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx) - they won't resolve
        if (lastError.message.includes("4")) {
          const statusMatch = lastError.message.match(/HTTP (\d{3})/);
          if (statusMatch) {
            const status = parseInt(statusMatch[1], 10);
            if (status >= 400 && status < 500) {
              throw lastError;
            }
          }
        }

        // Wait briefly before retry (only if we have retries left)
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    throw lastError ?? new Error("AI generation failed after retries");
  }

  private async callGemini(
    prompt: string,
    systemPrompt: string
  ): Promise<string> {
    const url = `${GEMINI_ENDPOINT}?key=${this.apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Gemini API HTTP ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(
          "Gemini response missing text content"
        );
      }

      return text;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Gemini API request timed out after 10s");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
