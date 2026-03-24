"use client";

import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { IdentityCard } from "@/components/identidade/identity-card";
import { AddIdentityDialog } from "@/components/identidade/add-identity-dialog";
import { useForestStore } from "@/lib/stores/forest-store";
import { inferZoneFromValues } from "@/lib/utils/forest-engine";
import type { Identity, Habit, HabitLog } from "@/types/database";

// --------------- Mock data ---------------

const today = new Date().toISOString().split("T")[0];

// Generate 30 days of mock habit logs for strength/streak calculations
function generateMockLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = new Date();

  // hab-1 (Estudar): 22 ideal, 4 minimum over 30 days = strong
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    if (i < 7) {
      // Last 7 days: all ideal (current streak = 7)
      logs.push({
        id: `log-h1-${i}`,
        habit_id: "hab-1",
        user_id: "user-1",
        date,
        version: "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i < 11) {
      // days 7-10: minimum
      logs.push({
        id: `log-h1-${i}`,
        habit_id: "hab-1",
        user_id: "user-1",
        date,
        version: "minimum",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i < 26 && i % 3 !== 0) {
      // days 11-25: most ideal, skip every 3rd
      logs.push({
        id: `log-h1-${i}`,
        habit_id: "hab-1",
        user_id: "user-1",
        date,
        version: "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    }
  }

  // hab-2 (Ler): moderate - 15 days, mix of ideal/min
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    if (i < 3) {
      logs.push({
        id: `log-h2-${i}`,
        habit_id: "hab-2",
        user_id: "user-1",
        date,
        version: "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i >= 3 && i < 5) {
      // break streak
    } else if (i < 20 && i % 2 === 0) {
      logs.push({
        id: `log-h2-${i}`,
        habit_id: "hab-2",
        user_id: "user-1",
        date,
        version: i % 4 === 0 ? "minimum" : "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    }
  }

  // hab-3 (Treinar): good consistency
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    // Only weekdays
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    if (i < 12) {
      logs.push({
        id: `log-h3-${i}`,
        habit_id: "hab-3",
        user_id: "user-1",
        date,
        version: i % 5 === 0 ? "minimum" : "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i < 25 && i % 2 === 0) {
      logs.push({
        id: `log-h3-${i}`,
        habit_id: "hab-3",
        user_id: "user-1",
        date,
        version: "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    }
  }

  // hab-4 (Skincare): consistent
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    if (i < 20) {
      logs.push({
        id: `log-h4-${i}`,
        habit_id: "hab-4",
        user_id: "user-1",
        date,
        version: i % 3 === 0 ? "minimum" : "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    }
  }

  // hab-5 (Nao fumar): lower, with some skipped days
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    if (i < 4) {
      logs.push({
        id: `log-h5-${i}`,
        habit_id: "hab-5",
        user_id: "user-1",
        date,
        version: "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i >= 4 && i < 6) {
      logs.push({
        id: `log-h5-${i}`,
        habit_id: "hab-5",
        user_id: "user-1",
        date,
        version: "skipped",
        notes: null,
        created_at: d.toISOString(),
      });
    } else if (i < 20 && i % 3 !== 0) {
      logs.push({
        id: `log-h5-${i}`,
        habit_id: "hab-5",
        user_id: "user-1",
        date,
        version: i % 4 === 0 ? "minimum" : "ideal",
        notes: null,
        created_at: d.toISOString(),
      });
    }
  }

  return logs;
}

const MOCK_LOGS = generateMockLogs();

// Mock user values
const MOCK_USER_VALUES = [
  { id: "val-1", name: "Crescimento" },
  { id: "val-2", name: "Saúde" },
  { id: "val-3", name: "Conhecimento" },
  { id: "val-4", name: "Conexão" },
  { id: "val-5", name: "Presença" },
];

const MOCK_IDENTITIES: Identity[] = [
  {
    id: "id-1",
    user_id: "user-1",
    name: "Estudioso equilibrado",
    description: "Aprender com constância, sem perfeccionismo",
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
    linked_values: ["Crescimento", "Conhecimento"],
    strength: 72,
  },
  {
    id: "id-2",
    user_id: "user-1",
    name: "Corpo em construção",
    description: "Cuidar do corpo com respeito e regularidade",
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
    linked_values: ["Saúde", "Presença"],
    strength: 61,
  },
  {
    id: "id-3",
    user_id: "user-1",
    name: "Não fumante em construção",
    description: null,
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 2,
    linked_values: ["Saúde"],
    strength: 38,
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
    species_id: "ipe_amarelo",
  },
  {
    id: "hab-2",
    user_id: "user-1",
    identity_id: "id-1",
    name: "Ler",
    ideal_version: "30 páginas",
    minimum_version: "1 página",
    common_saboteurs: ["cansaço", "procrastinação"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
    species_id: "lavanda",
  },
  {
    id: "hab-3",
    user_id: "user-1",
    identity_id: "id-2",
    name: "Treinar",
    ideal_version: "Treino completo na academia",
    minimum_version: "15 min de exercício em casa",
    common_saboteurs: ["cansaço", "tudo-ou-nada"],
    frequency: "weekdays",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
    species_id: "bambu",
  },
  {
    id: "hab-4",
    user_id: "user-1",
    identity_id: "id-2",
    name: "Skincare",
    ideal_version: "Rotina completa",
    minimum_version: "Lavar o rosto",
    common_saboteurs: ["procrastinação"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
    species_id: "camelia",
  },
  {
    id: "hab-5",
    user_id: "user-1",
    identity_id: "id-3",
    name: "Não fumar",
    ideal_version: "Dia inteiro sem cigarro",
    minimum_version: "Não fumar nas primeiras 4h",
    common_saboteurs: ["cansaço", "comparação"],
    frequency: "daily",
    custom_days: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
    species_id: "araucaria",
  },
];

// --------------- Page ---------------

export default function IdentidadePage() {
  const [identities, setIdentities] = useState<Identity[]>(MOCK_IDENTITIES);
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [allLogs] = useState<HabitLog[]>(MOCK_LOGS);

  // Add identity
  const handleAddIdentity = (
    name: string,
    description: string | null,
    linkedValues: string[]
  ) => {
    const newIdentity: Identity = {
      id: `id-${Date.now()}`,
      user_id: "user-1",
      name,
      description,
      icon: null,
      active: true,
      created_at: new Date().toISOString(),
      order_index: identities.length,
      linked_values: linkedValues,
      strength: 0,
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
      saboteur_description?: string;
      species_id?: string;
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
      species_id: habit.species_id ?? null,
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

    // Grow the habit's plant in the forest
    const habit = habits.find((h) => h.id === habitId);
    if (habit?.species_id) {
      const identity = identities.find((i) => i.id === habit.identity_id);
      const zone = identity ? inferZoneFromValues(identity.linked_values) : "general";
      useForestStore.getState().growHabitPlant({
        habitId,
        habitLogId: newLog.id,
        completionType: version,
        speciesId: habit.species_id,
        zone,
      });
    }
  };

  return (
    <div className="ancora-container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-semibold text-text-primary">
            Quem você está construindo
          </h1>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Suas identidades são construídas ação por ação, não pela perfeição.
        </p>
      </div>

      {/* Identity cards */}
      <div className="space-y-4">
        {identities.map((identity) => {
          const identityHabits = habits.filter(
            (h) => h.identity_id === identity.id && h.active
          );
          const identityLogs = allLogs.filter((log) =>
            identityHabits.some((h) => h.id === log.habit_id)
          );
          return (
            <IdentityCard
              key={identity.id}
              identity={identity}
              habits={identityHabits}
              todayLogs={todayLogs}
              allLogs={identityLogs}
              onLogVersion={handleLogVersion}
              onAddHabit={handleAddHabit}
            />
          );
        })}
      </div>

      {/* Add identity */}
      <AddIdentityDialog
        onAdd={handleAddIdentity}
        availableValues={MOCK_USER_VALUES.map((v) => v.name)}
      />
    </div>
  );
}
