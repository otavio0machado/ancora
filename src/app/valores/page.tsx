"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ValueCard, type ValueCardValue } from "@/components/valores/value-card";
import { AddValueDialog, type NewValueData } from "@/components/valores/add-value-dialog";
import { cn } from "@/lib/utils/cn";

// --------------- Constants ---------------

const MAX_VALUES = 7;

// --------------- Page ---------------

export default function ValoresPage() {
  const [values, setValues] = useState<ValueCardValue[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<ValueCardValue | null>(null);

  // ---- Handlers ----

  const handleAddValue = useCallback(
    (data: NewValueData) => {
      if (editingValue) {
        // Update existing value
        setValues((prev) =>
          prev.map((v) =>
            v.id === editingValue.id
              ? { ...v, name: data.name, description: data.description || null, icon: data.icon }
              : v
          )
        );
        setEditingValue(null);
      } else {
        // Add new value
        const newValue: ValueCardValue = {
          id: crypto.randomUUID(),
          name: data.name,
          description: data.description || null,
          icon: data.icon,
          active: true,
          order_index: values.length,
        };
        setValues((prev) => [...prev, newValue]);
      }
    },
    [editingValue, values.length]
  );

  const handleEdit = useCallback((value: ValueCardValue) => {
    setEditingValue(value);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setValues((prev) =>
      prev
        .filter((v) => v.id !== id)
        .map((v, i) => ({ ...v, order_index: i }))
    );
  }, []);

  const handleToggleActive = useCallback((id: string) => {
    setValues((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, active: !v.active } : v
      )
    );
  }, []);

  const handleOpenDialog = () => {
    setEditingValue(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingValue(null);
  };

  const activeCount = values.filter((v) => v.active).length;
  const canAdd = values.length < MAX_VALUES;

  return (
    <main className="ancora-container py-8 pb-24">
      <div className="flex flex-col gap-8">
        {/* ---- Header ---- */}
        <header className="flex flex-col gap-2 animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary">
            Seus Valores
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed ancora-text-balance">
            Os principios que guiam suas escolhas
          </p>
        </header>

        {/* ---- Empty state with suggestions ---- */}
        {values.length === 0 && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div
              className={cn(
                "rounded-2xl border border-border-subtle bg-surface p-6",
                "text-center"
              )}
            >
              <div className="text-4xl mb-4" aria-hidden="true">
                {"\uD83E\uDDED"}
              </div>
              <p className="text-sm text-text-primary font-medium mb-2">
                Valores sao sua bussola interna
              </p>
              <p className="text-xs text-text-secondary leading-relaxed mb-6 max-w-xs mx-auto">
                Na Terapia de Aceitacao e Compromisso (ACT), valores sao direcoes de vida que
                dao sentido as suas acoes. Nao sao metas a serem atingidas, mas principios
                que orientam cada passo.
              </p>
              <Button size="lg" onClick={handleOpenDialog} className="w-full">
                <Plus size={16} strokeWidth={2} />
                Adicionar meu primeiro valor
              </Button>
            </div>
          </div>
        )}

        {/* ---- Values list ---- */}
        {values.length > 0 && (
          <div className="flex flex-col gap-3 animate-slide-up">
            {/* Counter */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">
                {activeCount} valor{activeCount !== 1 ? "es" : ""} ativo{activeCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-text-muted">
                {values.length}/{MAX_VALUES}
              </p>
            </div>

            {/* Cards */}
            {values.map((value) => (
              <ValueCard
                key={value.id}
                value={value}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}

            {/* Add button */}
            {canAdd && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleOpenDialog}
                className="w-full mt-2"
              >
                <Plus size={16} strokeWidth={2} />
                Adicionar valor
              </Button>
            )}

            {/* Max reached message */}
            {!canAdd && (
              <p className="text-xs text-text-muted text-center mt-2">
                Maximo de {MAX_VALUES} valores. Manter o foco e parte do processo.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Add/Edit Dialog ---- */}
      <AddValueDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSave={handleAddValue}
        editingValue={
          editingValue
            ? {
                name: editingValue.name,
                description: editingValue.description ?? "",
                icon: editingValue.icon ?? "\uD83C\uDF31",
              }
            : null
        }
        existingNames={values.map((v) => v.name)}
      />
    </main>
  );
}
