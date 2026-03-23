"use client";

import { useState } from "react";
import { PenLine, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --------------- Types ---------------

export interface WeeklyReflectionData {
  whatWorked: string;
  whatWasHard: string;
  whatToAdjust: string;
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
  const [whatWorked, setWhatWorked] = useState(
    initialData?.whatWorked ?? ""
  );
  const [whatWasHard, setWhatWasHard] = useState(
    initialData?.whatWasHard ?? ""
  );
  const [whatToAdjust, setWhatToAdjust] = useState(
    initialData?.whatToAdjust ?? ""
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ whatWorked, whatWasHard, whatToAdjust });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasContent = whatWorked || whatWasHard || whatToAdjust;

  return (
    <Card className={cn("border-border-subtle", className)}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <PenLine size={14} strokeWidth={1.5} className="text-text-muted" />
          Reflexao pessoal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* What worked */}
        <div className="space-y-2">
          <Label className="text-sm">
            O que funcionou essa semana?
          </Label>
          <Textarea
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            placeholder="Momentos, habitos ou decisoes que ajudaram..."
            rows={3}
          />
        </div>

        {/* What was hard */}
        <div className="space-y-2">
          <Label className="text-sm">
            O que foi dificil?
          </Label>
          <Textarea
            value={whatWasHard}
            onChange={(e) => setWhatWasHard(e.target.value)}
            placeholder="Desafios, padroes repetidos, momentos dificeis..."
            rows={3}
          />
        </div>

        {/* What to adjust */}
        <div className="space-y-2">
          <Label className="text-sm">
            O que quero ajustar?
          </Label>
          <Textarea
            value={whatToAdjust}
            onChange={(e) => setWhatToAdjust(e.target.value)}
            placeholder="Mudancas pequenas e concretas para a proxima semana..."
            rows={3}
          />
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
            "Salvar reflexao"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
