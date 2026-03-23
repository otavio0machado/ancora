// ============================================================
// API Route: POST /api/ai/ajuste
// Day adjustment based on check-in state
// ============================================================

import { NextResponse } from "next/server";
import { aiDayAdjustInputSchema } from "@/lib/schemas";
import { aiService } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = aiDayAdjustInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await aiService.adjustDay(validated.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /ai/ajuste] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar ajuste do dia" },
      { status: 500 }
    );
  }
}
