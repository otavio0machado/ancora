"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Palette,
  Bell,
  Database,
  Info,
  Download,
  Trash2,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/stores/app-store";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { useImpulseStore } from "@/lib/stores/impulse-store";

// --------------- Theme effect ---------------

function useThemeEffect(theme: "system" | "light" | "dark") {
  useEffect(() => {
    const root = document.documentElement;

    // Clean up both classes first
    root.classList.remove("dark", "light");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.add("light");
    }
    // "system" → no class, CSS media query handles it
  }, [theme]);
}

// --------------- Setting row ---------------

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// --------------- Section header ---------------

interface SectionProps {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-1 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-text-muted" strokeWidth={1.5} />
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-surface px-4 divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}

// --------------- Toggle switch ---------------

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-accent" : "bg-surface-sunken border border-border-subtle",
      )}
    >
      <span
        className={cn(
          "inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm",
          "transition-transform duration-200",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

// --------------- Theme icon ---------------

function ThemeIcon({ theme }: { theme: string }) {
  switch (theme) {
    case "light":
      return <Sun size={14} className="text-warning" strokeWidth={1.5} />;
    case "dark":
      return <Moon size={14} className="text-accent" strokeWidth={1.5} />;
    default:
      return <Monitor size={14} className="text-text-muted" strokeWidth={1.5} />;
  }
}

// --------------- Page ---------------

export default function ConfiguracoesPage() {
  const { user, setUser, preferences, setPreferences } = useAppStore();
  const [name, setName] = useState(user?.name ?? "");
  const [nameSaved, setNameSaved] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);

  // Apply theme
  useThemeEffect(preferences.theme);

  // Sync name from store
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSaveName = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (user) {
      setUser({ ...user, name: trimmed });
    } else {
      setUser({
        id: "local-user",
        email: "",
        name: trimmed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        values: [],
        onboarding_completed: false,
      });
    }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }, [name, user, setUser]);

  const handleExportData = useCallback(() => {
    const appState = useAppStore.getState();
    const checkInState = useCheckInStore.getState();
    const impulseState = useImpulseStore.getState();

    const exportData = {
      exportedAt: new Date().toISOString(),
      app: "Âncora",
      user: appState.user,
      preferences: appState.preferences,
      todayCheckIn: checkInState.todayCheckIn,
      checkIn: checkInState.checkIn,
      recentImpulses: impulseState.recentImpulses,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ancora-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleClearData = useCallback(() => {
    // Reset all stores
    useCheckInStore.setState({
      checkIn: { energy: 3, mood: 3, anxiety: 3, focus: 3, impulsivity: 3 },
      todayCheckIn: null,
      isSubmitting: false,
      isCompleted: false,
      error: null,
    });

    useImpulseStore.getState().resetFlow();
    useImpulseStore.setState({ recentImpulses: [] });

    useAppStore.setState({
      user: null,
      rescueMode: false,
      preferences: { notifications: true, theme: "system", language: "pt-BR" },
    });

    // Clear localStorage
    try {
      localStorage.clear();
    } catch {
      // Ignore if not available
    }

    setName("");
    setDataCleared(true);
    setClearDialogOpen(false);
    setTimeout(() => setDataCleared(false), 3000);
  }, []);

  return (
    <main className="ancora-container py-8 pb-24">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-1 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/hoje"
              className="text-text-muted hover:text-text-secondary transition-colors -ml-1"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </Link>
            <h1 className="text-xl font-semibold text-text-primary">
              Configurações
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            Seus ajustes pessoais.
          </p>
        </header>

        {/* ===== PROFILE ===== */}
        <Section icon={User} title="Perfil">
          <SettingRow label="Nome" description="Como o app se dirige a você.">
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-36 text-right text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveName}
                disabled={!name.trim() || name.trim() === user?.name}
              >
                {nameSaved ? "Salvo" : "Salvar"}
              </Button>
            </div>
          </SettingRow>

          {user?.email && (
            <SettingRow label="Email">
              <span className="text-sm text-text-muted">{user.email}</span>
            </SettingRow>
          )}
        </Section>

        {/* ===== APPEARANCE ===== */}
        <Section icon={Palette} title="Aparência">
          <SettingRow label="Tema" description="Controle a aparência do app.">
            <div className="flex items-center gap-2">
              <ThemeIcon theme={preferences.theme} />
              <Select
                value={preferences.theme}
                onValueChange={(val) =>
                  setPreferences({ theme: val as "system" | "light" | "dark" })
                }
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingRow>

          <SettingRow label="Idioma">
            <Select
              value={preferences.language}
              onValueChange={(val) =>
                setPreferences({ language: val as "pt-BR" | "en" })
              }
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </Section>

        {/* ===== NOTIFICATIONS ===== */}
        <Section icon={Bell} title="Notificações">
          <SettingRow
            label="Ativar notificações"
            description="Lembretes de check-in e alertas de padrões."
          >
            <Toggle
              checked={preferences.notifications}
              onChange={(val) => setPreferences({ notifications: val })}
            />
          </SettingRow>
        </Section>

        {/* ===== DATA ===== */}
        <Section icon={Database} title="Dados">
          <SettingRow
            label="Exportar dados"
            description="Baixe seus dados em formato JSON."
          >
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={14} strokeWidth={1.5} />
              Exportar
            </Button>
          </SettingRow>

          <SettingRow
            label="Limpar dados locais"
            description="Remove todos os dados armazenados no dispositivo."
          >
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-alert hover:text-alert">
                  <Trash2 size={14} strokeWidth={1.5} />
                  Limpar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Limpar todos os dados?</DialogTitle>
                  <DialogDescription>
                    Isso vai remover check-ins, impulsos, preferências e todos os dados
                    armazenados localmente. Essa ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setClearDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleClearData}
                    className="bg-alert hover:bg-alert/90 text-white"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                    Confirmar exclusão
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SettingRow>

          {dataCleared && (
            <div className="py-3 animate-fade-in">
              <p className="text-xs text-success font-medium">
                Dados limpos com sucesso.
              </p>
            </div>
          )}
        </Section>

        {/* ===== ABOUT ===== */}
        <Section icon={Info} title="Sobre">
          <SettingRow label="Versão">
            <span className="text-sm text-text-muted tabular-nums">1.0.0</span>
          </SettingRow>
          <SettingRow label="Feito com">
            <span className="text-sm text-text-muted">
              Cuidado e intenção
            </span>
          </SettingRow>
        </Section>

        {/* Footer note */}
        <p className="text-xs text-text-muted text-center pt-4 animate-fade-in">
          Âncora — seu espaço de regulação pessoal.
        </p>
      </div>
    </main>
  );
}
