"use client";

import { useState } from "react";
import { Pencil, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

// --------------- Types ---------------

export interface ValueCardValue {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  order_index: number;
}

interface ValueCardProps {
  value: ValueCardValue;
  onEdit: (value: ValueCardValue) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

// --------------- Component ---------------

export function ValueCard({ value, onEdit, onDelete, onToggleActive }: ValueCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = () => {
    if (confirmingDelete) {
      onDelete(value.id);
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
  };

  return (
    <Card
      className={cn(
        "animate-fade-in transition-all duration-300",
        !value.active && "opacity-50"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Emoji icon */}
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-2xl",
              "flex items-center justify-center",
              "bg-accent-subtle border border-accent/10",
              "text-2xl",
              !value.active && "bg-surface-sunken border-border-subtle"
            )}
          >
            {value.icon || "~"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-sm font-semibold text-text-primary",
                !value.active && "text-text-muted"
              )}
            >
              {value.name}
            </h3>
            {value.description && (
              <p
                className={cn(
                  "text-xs text-text-secondary mt-1 leading-relaxed",
                  !value.active && "text-text-muted"
                )}
              >
                {value.description}
              </p>
            )}

            {!value.active && (
              <p className="text-[10px] text-text-muted mt-1.5 uppercase tracking-wider">
                Desativado
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(value.id)}
              aria-label={value.active ? "Desativar valor" : "Ativar valor"}
              className={cn(
                "h-8 w-8",
                value.active
                  ? "text-accent hover:text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Power size={14} strokeWidth={1.5} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(value)}
              aria-label="Editar valor"
              className="h-8 w-8 text-text-muted hover:text-text-secondary"
            >
              <Pencil size={14} strokeWidth={1.5} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              onBlur={handleCancelDelete}
              aria-label={confirmingDelete ? "Confirmar exclusão" : "Excluir valor"}
              className={cn(
                "h-8 w-8",
                confirmingDelete
                  ? "text-alert hover:text-alert"
                  : "text-text-muted hover:text-alert"
              )}
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Delete confirmation */}
        {confirmingDelete && (
          <div className="mt-3 pt-3 border-t border-border-subtle animate-fade-in">
            <p className="text-xs text-text-secondary mb-2">
              Tem certeza que deseja excluir este valor?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="text-xs"
              >
                Sim, excluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelDelete}
                className="text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
