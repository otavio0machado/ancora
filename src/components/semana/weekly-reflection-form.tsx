"use client";

import { useState } from "react";
import { PenLine, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --------------- Types ---------------

export interface WeeklyReflectionData {
  closerToValues: string;
  awayFromValues: string;
  proudRegulationMoment: string;
  adjustments: string[];
}

interface WeeklyReflectionFormProps {
  initialData?: WeeklyReflectionData;
  onSave: (data: WeeklyReflectionData) => void;
  isSaving?: boolean;
  className?: string;
}

// --------------- Component ---------------

export function WeeklyReflectionForm({
  initialData,
  onSave,
  isSaving = false,
  className,
}: WeeklyReflectionFormProps) {
  const [closerToValues, setCloserToValues] = useState(
    initialData?.closerToValues ?? ""
  );
  const [awayFromValues, setAwayFromValues] = useState(
    initialData?.awayFromValues ?? ""
  );
  const [proudMoment, setProudMoment] = useState(
    initialData?.proudRegulationMoment ?? ""
  );
  const [adjustment1, setAdjustment1] = useState(
    initialData?.adjustments?.[0] ?? ""
  );
  const [adjustment2, setAdjustment2] = useState(
    initialData?.adjustments?.[1] ?? ""
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const adjustments = [adjustment1, adjustment2].filter(Boolean);
    onSave({
      closerToValues,
      awayFromValues,
      proudRegulationMoment: proudMoment,
      adjustments,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasContent =
    closerToValues || awayFromValues || proudMoment || adjustment1;

  return (
    <Card className={cn("border-border-subtle", className)}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <PenLine size={14} strokeWidth={1.5} className="text-text-muted" />
          Reflexão guiada
        </CardTitle>
        <p className="text-xs text-text-muted leading-relaxed mt-1">
          Perguntas baseadas em ACT para conectar com o que importa.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Q1: Closer to values */}
        <div className="space-y-2">
          <Label className="text-sm leading-relaxed">
            O que te aproximou dos seus valores essa semana?
          </Label>
          <Textarea
            value={closerToValues}
            onChange={(e) => setCloserToValues(e.target.value)}
            placeholder="Ações, momentos ou decisões que refletiram seus valores..."
            rows={3}
          />
        </div>

        {/* Q2: Away from values */}
        <div className="space-y-2">
          <Label className="text-sm leading-relaxed">
            O que te afastou?
          </Label>
          <Textarea
            value={awayFromValues}
            onChange={(e) => setAwayFromValues(e.target.value)}
            placeholder="Padrões, sabotadores ou momentos de desregulação..."
            rows={3}
          />
        </div>

        {/* Q3: Proud regulation moment */}
        <div className="space-y-2">
          <Label className="text-sm leading-relaxed">
            Qual momento de regulação te orgulhou?
          </Label>
          <p className="text-[10px] text-text-muted italic">
            Celebre a regulação, não a conquista.
          </p>
          <Textarea
            value={proudMoment}
            onChange={(e) => setProudMoment(e.target.value)}
            placeholder="Um momento em que você se regulou mesmo sendo difícil..."
            rows={3}
          />
        </div>

        {/* Q4: Adjustments (max 2) */}
        <div className="space-y-2">
          <Label className="text-sm leading-relaxed">
            O que quer ajustar na próxima semana?
          </Label>
          <div className="flex items-start gap-1.5 mb-2">
            <Info size={12} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-accent">
              Máximo 2 ajustes. Menos mudanças = mais chance de acontecerem.
            </p>
          </div>
          <div className="space-y-2">
            <Textarea
              value={adjustment1}
              onChange={(e) => setAdjustment1(e.target.value)}
              placeholder="Ajuste 1: algo pequeno e concreto..."
              rows={2}
            />
            <Textarea
              value={adjustment2}
              onChange={(e) => setAdjustment2(e.target.value)}
              placeholder="Ajuste 2 (opcional): outro ajuste pequeno..."
              rows={2}
            />
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasContent}
          size="md"
          className="w-full"
        >
          {saved ? (
            <>
              <Check size={16} />
              Salvo
            </>
          ) : isSaving ? (
            "Salvando..."
          ) : (
            "Salvar reflexão"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
