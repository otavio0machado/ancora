"use client";

import { useState } from "react";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";

const SKIN_TONES = [
  { color: "#FDBB97", label: "Tom 1" },
  { color: "#D4956B", label: "Tom 2" },
  { color: "#A0674B", label: "Tom 3" },
  { color: "#6B3F2E", label: "Tom 4" },
  { color: "#3D2317", label: "Tom 5" },
  { color: "#F5D6BA", label: "Tom 6" },
];

const HAIR_STYLES = [
  "Curto", "Medio", "Longo", "Cacheado",
  "Rabo", "Moicano", "Careca", "Afro",
];

const HAIR_COLORS = [
  { color: "#3E2723", label: "Castanho" },
  { color: "#212121", label: "Preto" },
  { color: "#F9A825", label: "Loiro" },
  { color: "#D84315", label: "Ruivo" },
  { color: "#5D4037", label: "Marrom" },
  { color: "#9E9E9E", label: "Grisalho" },
  { color: "#E91E63", label: "Rosa" },
  { color: "#2196F3", label: "Azul" },
];

const OUTFITS = [
  "Casual", "Esportivo", "Florestal", "Aventureiro",
  "Estudante", "Artista", "Jardineiro", "Explorador",
  "Tranquilo", "Cozy",
];

const ACCESSORIES = [
  "Nenhum", "Oculos", "Chapeu", "Cachecol", "Mochila", "Bandana",
];

interface NumberSelectorProps {
  label: string;
  value: number;
  max: number;
  displayValues: string[] | { color: string; label: string }[];
  onChange: (value: number) => void;
}

function NumberSelector({ label, value, max, displayValues, onChange }: NumberSelectorProps) {
  const current = displayValues[value];
  const displayText = typeof current === "string" ? current : current?.label ?? `${value}`;
  const displayColor = typeof current === "object" ? current.color : undefined;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(value > 0 ? value - 1 : max)}
          className="w-7 h-7 rounded-md bg-surface-sunken flex items-center justify-center
            text-text-muted hover:text-text-primary ancora-transition"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex items-center gap-1.5 min-w-[80px] justify-center">
          {displayColor && (
            <div
              className="w-4 h-4 rounded-full border border-border-subtle"
              style={{ backgroundColor: displayColor }}
            />
          )}
          <span className="text-xs font-medium text-text-primary">{displayText}</span>
        </div>
        <button
          onClick={() => onChange(value < max ? value + 1 : 0)}
          className="w-7 h-7 rounded-md bg-surface-sunken flex items-center justify-center
            text-text-muted hover:text-text-primary ancora-transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

interface AvatarCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function AvatarCustomizer({ open, onClose }: AvatarCustomizerProps) {
  const { avatar, updateAvatar } = useForestStore();

  const [skinTone, setSkinTone] = useState(avatar?.skin_tone ?? 0);
  const [hairStyle, setHairStyle] = useState(avatar?.hair_style ?? 0);
  const [hairColor, setHairColor] = useState(avatar?.hair_color ?? 0);
  const [outfit, setOutfit] = useState(avatar?.outfit ?? 0);
  const [accessory, setAccessory] = useState(avatar?.accessory ?? 0);

  if (!open) return null;

  const handleSave = () => {
    updateAvatar({
      skin_tone: skinTone,
      hair_style: hairStyle,
      hair_color: hairColor,
      outfit: outfit,
      accessory: accessory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-lg",
          "bg-background rounded-t-2xl",
          "border-t border-border-subtle",
          "p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          "animate-slide-up"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">
              Personalizar Avatar
            </h2>
          </div>
          <button
            onClick={handleSave}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium",
              "bg-accent text-white hover:bg-accent-hover",
              "ancora-transition"
            )}
          >
            Salvar
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "w-20 h-20 rounded-xl",
              "bg-surface-sunken",
              "flex items-center justify-center"
            )}
          >
            <div className="relative">
              {/* Simple avatar preview */}
              <div
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: SKIN_TONES[skinTone]?.color }}
              />
              <div
                className="absolute -top-1 left-1 right-1 h-4 rounded-t-full"
                style={{ backgroundColor: HAIR_COLORS[hairColor]?.color }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1 divide-y divide-border-subtle">
          <NumberSelector
            label="Tom de pele"
            value={skinTone}
            max={SKIN_TONES.length - 1}
            displayValues={SKIN_TONES}
            onChange={setSkinTone}
          />
          <NumberSelector
            label="Cabelo"
            value={hairStyle}
            max={HAIR_STYLES.length - 1}
            displayValues={HAIR_STYLES}
            onChange={setHairStyle}
          />
          <NumberSelector
            label="Cor do cabelo"
            value={hairColor}
            max={HAIR_COLORS.length - 1}
            displayValues={HAIR_COLORS}
            onChange={setHairColor}
          />
          <NumberSelector
            label="Roupa"
            value={outfit}
            max={OUTFITS.length - 1}
            displayValues={OUTFITS}
            onChange={setOutfit}
          />
          <NumberSelector
            label="Acessorio"
            value={accessory}
            max={ACCESSORIES.length - 1}
            displayValues={ACCESSORIES}
            onChange={setAccessory}
          />
        </div>
      </div>
    </div>
  );
}
