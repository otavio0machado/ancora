// ============================================================
// API Route: POST /api/ai/impulso
// Impulse protocol with DBT techniques
// ============================================================

import { NextResponse } from "next/server";
import { aiImpulseInputSchema } from "@/lib/schemas";
import { aiService } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = aiImpulseInputSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await aiService.impulseProtocol(validated.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /ai/impulso] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar protocolo de impulso" },
      { status: 500 }
    );
  }
}
