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
import { Plus } from "lucide-react";

interface AddIdentityDialogProps {
  onAdd: (name: string, description: string | null) => void;
}

export function AddIdentityDialog({ onAdd }: AddIdentityDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name.trim(), description.trim() || null);
    setName("");
    setDescription("");
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
      <DialogContent>
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
