// ============================================================
// API Route: POST /api/ai/reflexao
// Weekly reflection with pattern analysis
// ============================================================

import { NextResponse } from "next/server";
import { aiWeeklyInputSchema } from "@/lib/schemas";
import { aiService } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = aiWeeklyInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await aiService.weeklyReflection(validated.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /ai/reflexao] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar reflexao semanal" },
      { status: 500 }
    );
  }
}
