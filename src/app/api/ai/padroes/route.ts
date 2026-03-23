// ============================================================
// API Route: POST /api/ai/padroes
// Pattern analysis - deep behavioral pattern detection
// ============================================================

import { NextResponse } from "next/server";
import { aiPatternInputSchema } from "@/lib/schemas";
import { aiService } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = aiPatternInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await aiService.analyzePatterns(validated.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /ai/padroes] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar analise de padroes" },
      { status: 500 }
    );
  }
}
