"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

// --------------- Constants ---------------

const EMOJI_OPTIONS = [
  "\uD83C\uDF31", // seedling
  "\uD83D\uDCDA", // books
  "\uD83D\uDCAA", // muscle
  "\uD83E\uDD1D", // handshake
  "\uD83E\uDDD8", // meditation
  "\u2B50",       // star
  "\uD83C\uDFAF", // target
  "\u2764\uFE0F", // heart
  "\uD83D\uDD25", // fire
  "\uD83C\uDF0A", // wave
];

export interface SuggestedValue {
  name: string;
  description: string;
  icon: string;
}

const SUGGESTED_VALUES: SuggestedValue[] = [
  { name: "Crescimento", description: "Buscar evolução pessoal e aprender constantemente", icon: "\uD83C\uDF31" },
  { name: "Saúde", description: "Cuidar do corpo e da mente com intencionalidade", icon: "\uD83D\uDCAA" },
  { name: "Conexão", description: "Construir e nutrir relacionamentos significativos", icon: "\uD83E\uDD1D" },
  { name: "Autonomia", description: "Fazer escolhas alinhadas com quem eu quero ser", icon: "\u2B50" },
  { name: "Presença", description: "Viver o momento com atenção e abertura", icon: "\uD83E\uDDD8" },
  { name: "Integridade", description: "Agir de acordo com meus princípios, mesmo quando é difícil", icon: "\u2764\uFE0F" },
  { name: "Conhecimento", description: "Explorar ideias e expandir minha compreensão do mundo", icon: "\uD83D\uDCDA" },
];

// --------------- Types ---------------

export interface NewValueData {
  name: string;
  description: string;
  icon: string;
}

interface AddValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: NewValueData) => void;
  /** If provided, we're editing an existing value */
  editingValue?: { name: string; description: string; icon: string } | null;
  /** Names of already-added values (to filter suggestions) */
  existingNames?: string[];
}

// --------------- Component ---------------

export function AddValueDialog({
  open,
  onOpenChange,
  onSave,
  editingValue,
  existingNames = [],
}: AddValueDialogProps) {
  const [name, setName] = useState(editingValue?.name ?? "");
  const [description, setDescription] = useState(editingValue?.description ?? "");
  const [icon, setIcon] = useState(editingValue?.icon ?? EMOJI_OPTIONS[0]);

  // Reset form when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(editingValue?.name ?? "");
      setDescription(editingValue?.description ?? "");
      setIcon(editingValue?.icon ?? EMOJI_OPTIONS[0]);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
    });
    onOpenChange(false);
  };

  const handleSelectSuggestion = (suggestion: SuggestedValue) => {
    setName(suggestion.name);
    setDescription(suggestion.description);
    setIcon(suggestion.icon);
  };

  const filteredSuggestions = SUGGESTED_VALUES.filter(
    (s) => !existingNames.some((n) => n.toLowerCase() === s.name.toLowerCase())
  );

  const isEditing = !!editingValue;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar valor" : "Novo valor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ajuste este valor para refletir melhor o que é importante para você."
              : "Valores são os princípios que guiam suas escolhas. O que importa pra você?"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-4">
          {/* Emoji selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Ícone
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl",
                    "flex items-center justify-center",
                    "transition-all duration-200",
                    "border-2",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    icon === emoji
                      ? "border-accent bg-accent-subtle scale-110"
                      : "border-border-subtle bg-surface hover:bg-surface-sunken hover:scale-105"
                  )}
                  aria-label={`Selecionar emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="value-name"
              className="text-xs font-medium text-text-secondary uppercase tracking-wider"
            >
              Nome do valor
            </label>
            <Input
              id="value-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Crescimento, Saúde, Conexão..."
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="value-description"
              className="text-xs font-medium text-text-secondary uppercase tracking-wider"
            >
              Descrição (opcional)
            </label>
            <Textarea
              id="value-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que esse valor significa pra você..."
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Suggestions (only when adding new, not editing) */}
          {!isEditing && filteredSuggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Sugestões
              </p>
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      "px-3 py-1.5 rounded-full",
                      "text-xs font-medium",
                      "border border-border-subtle bg-surface",
                      "hover:bg-surface-sunken hover:border-text-muted",
                      "transition-all duration-200",
                      "active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      name === suggestion.name && "border-accent bg-accent-subtle"
                    )}
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="md"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {isEditing ? "Salvar" : "Adicionar valor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
