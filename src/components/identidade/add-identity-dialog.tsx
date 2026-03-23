"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AddIdentityDialogProps {
  onAdd: (
    name: string,
    description: string | null,
    linkedValues: string[]
  ) => void;
  availableValues?: string[];
}

export function AddIdentityDialog({
  onAdd,
  availableValues = [],
}: AddIdentityDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name.trim(), description.trim() || null, selectedValues);
    setName("");
    setDescription("");
    setSelectedValues([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="md" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Nova identidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova identidade</DialogTitle>
          <DialogDescription>
            Quem voce quer se tornar? Defina uma identidade que represente seus
            valores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label
              htmlFor="identity-name"
              className="text-sm font-medium text-text-primary"
            >
              Nome
            </label>
            <Input
              id="identity-name"
              placeholder='Ex: "Estudioso equilibrado"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="identity-description"
              className="text-sm font-medium text-text-primary"
            >
              Descricao{" "}
              <span className="text-text-muted font-normal">(opcional)</span>
            </label>
            <Input
              id="identity-description"
              placeholder="Uma breve descricao dessa identidade..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Value linking */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
              Qual valor essa identidade apoia?
            </label>
            {availableValues.length > 0 ? (
              <>
                <p className="text-xs text-text-muted">
                  Conecte essa identidade aos seus valores para entender como
                  cada acao te aproxima do que importa.
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableValues.map((value) => {
                    const isSelected = selectedValues.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleValue(value)}
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1.5",
                          "text-xs font-medium transition-all duration-200",
                          "cursor-pointer",
                          isSelected
                            ? "border-accent bg-accent-subtle text-accent"
                            : "border-border bg-transparent text-text-secondary hover:bg-surface-sunken"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                {selectedValues.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedValues.map((v) => (
                      <Badge key={v} variant="default" className="text-[10px]">
                        {v}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-text-muted italic">
                Defina seus valores primeiro em Valores para conecta-los aqui.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Criar identidade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
