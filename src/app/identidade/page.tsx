"use client";

import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { IdentityCard } from "@/components/identidade/identity-card";
import { AddIdentityDialog } from "@/components/identidade/add-identity-dialog";
import type { Identity, Habit, HabitLog } from "@/types/database";

// --------------- Mock data ---------------

const today = new Date().toISOString().split("T")[0];

const MOCK_IDENTITIES: Identity[] = [
  {
    id: "id-1",
    user_id: "user-1",
    name: "Estudioso equilibrado",
    description: "Aprender com constancia, sem perfeccionismo",
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
  },
  {
    id: "id-2",
    user_id: "user-1",
    name: "Corpo em construcao",
    description: "Cuidar do corpo com respeito e regularidade",
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
  },
  {
    id: "id-3",
    user_id: "user-1",
    name: "Nao fumante em construcao",
    description: null,
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 2,
  },
];

const MOCK_HABITS: Habit[] = [
  {
    id: "hab-1",
    user_id: "user-1",
    identity_id: "id-1",
    name: "Estudar",
    ideal_version: "2h de estudo focado",
    minimum_version: "Abrir o livro por 10 min",
    common_saboteurs: ["perfeccionismo", "tudo-ou-nada"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
  },
  {
    id: "hab-2",
    user_id: "user-1",
    identity_id: "id-1",
    name: "Ler",
    ideal_version: "30 paginas",
    minimum_version: "1 pagina",
    common_saboteurs: ["cansaco", "procrastinacao"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
  },
  {
    id: "hab-3",
    user_id: "user-1",
    identity_id: "id-2",
    name: "Treinar",
    ideal_version: "Treino completo na academia",
    minimum_version: "15 min de exercicio em casa",
    common_saboteurs: ["cansaco", "tudo-ou-nada"],
    frequency: "weekdays",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
  },
  {
    id: "hab-4",
    user_id: "user-1",
    identity_id: "id-2",
    name: "Skincare",
    ideal_version: "Rotina completa",
    minimum_version: "Lavar o rosto",
    common_saboteurs: ["procrastinacao"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
  },
  {
    id: "hab-5",
    user_id: "user-1",
    identity_id: "id-3",
    name: "Nao fumar",
    ideal_version: "Dia inteiro sem cigarro",
    minimum_version: "Nao fumar nas primeiras 4h",
    common_saboteurs: ["cansaco", "comparacao"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
  },
];

// --------------- Page ---------------

export default function IdentidadePage() {
  const [identities, setIdentities] = useState<Identity[]>(MOCK_IDENTITIES);
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);

  // Add identity
  const handleAddIdentity = (name: string, description: string | null) => {
    const newIdentity: Identity = {
      id: `id-${Date.now()}`,
      user_id: "user-1",
      name,
      description,
      icon: null,
      active: true,
      created_at: new Date().toISOString(),
      order_index: identities.length,
    };
    setIdentities((prev) => [...prev, newIdentity]);
  };

  // Add habit to identity
  const handleAddHabit = (
    identityId: string,
    habit: {
      name: string;
      ideal_version: string;
      minimum_version: string;
      common_saboteurs: string[];
      frequency: "daily" | "weekdays" | "custom";
    }
  ) => {
    const newHabit: Habit = {
      id: `hab-${Date.now()}`,
      user_id: "user-1",
      identity_id: identityId,
      name: habit.name,
      ideal_version: habit.ideal_version,
      minimum_version: habit.minimum_version,
      common_saboteurs: habit.common_saboteurs,
      frequency: habit.frequency,
      custom_days: null,
      active: true,
      created_at: new Date().toISOString(),
      order_index: habits.filter((h) => h.identity_id === identityId).length,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  // Log a habit version
  const handleLogVersion = (
    habitId: string,
    version: "ideal" | "minimum"
  ) => {
    const newLog: HabitLog = {
      id: `log-${Date.now()}`,
      habit_id: habitId,
      user_id: "user-1",
      date: today,
      version,
      notes: null,
      created_at: new Date().toISOString(),
    };
    setTodayLogs((prev) => {
      // Replace existing log for this habit if any
      const filtered = prev.filter((log) => log.habit_id !== habitId);
      return [...filtered, newLog];
    });
  };

  return (
    <div className="ancora-container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-semibold text-text-primary">
            Identidade
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Quem voce esta construindo ser, um habito por vez.
        </p>
      </div>

      {/* Identity cards */}
      <div className="space-y-4">
        {identities.map((identity) => {
          const identityHabits = habits.filter(
            (h) => h.identity_id === identity.id && h.active
          );
          return (
            <IdentityCard
              key={identity.id}
              identity={identity}
              habits={identityHabits}
              todayLogs={todayLogs}
              onLogVersion={handleLogVersion}
              onAddHabit={handleAddHabit}
            />
          );
        })}
      </div>

      {/* Add identity */}
      <AddIdentityDialog onAdd={handleAddIdentity} />
    </div>
  );
}
