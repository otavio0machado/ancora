// ============================================================
// API Route: POST /api/ai/recuperacao
// Recovery guidance - compassionate support after relapse
// ============================================================

import { NextResponse } from "next/server";
import { aiRecoveryInputSchema } from "@/lib/schemas";
import { aiService } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = aiRecoveryInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await aiService.recoveryGuidance(validated.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /ai/recuperacao] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar orientacao de recuperacao" },
      { status: 500 }
    );
  }
}
