// ============================================================
// Database types for Ancora - Supabase / Postgres
// ============================================================

// --------------- Row types ---------------
// Using `type` instead of `interface` so that these satisfy
// Record<string, unknown> (required by Supabase's GenericTable).

export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  values: string[]; // ACT values (e.g. "growth", "health", "connection")
  onboarding_completed: boolean;
};

export type CheckIn = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  energy: number; // 1-5
  mood: number; // 1-5
  anxiety: number; // 1-5
  focus: number; // 1-5
  impulsivity: number; // 1-5
  notes: string | null;
  sleep_quality: number | null; // 1-5
  sleep_hours: number | null; // approximate
  created_at: string;
};

export type Identity = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  created_at: string;
  order_index: number;
  linked_values: string[]; // ACT values this identity supports
  strength: number; // 0-100, calculated from habit completion
};

export type Habit = {
  id: string;
  user_id: string;
  identity_id: string;
  name: string;
  ideal_version: string; // "Estudar 2h com foco"
  minimum_version: string; // "Abrir o livro e ler 1 pagina"
  common_saboteurs: string[]; // ["perfeccionismo", "tudo-ou-nada"]
  frequency: "daily" | "weekdays" | "custom";
  custom_days: number[] | null; // 0-6 (Sunday-Saturday)
  active: boolean;
  created_at: string;
  order_index: number;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  version: "ideal" | "minimum" | "skipped";
  notes: string | null;
  created_at: string;
};

export type DayPriority = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  text: string;
  completed: boolean;
  order_index: number; // max 3
  created_at: string;
};

export type FocusSession = {
  id: string;
  user_id: string;
  objective: string;
  duration_planned: number; // minutes
  duration_actual: number | null; // minutes
  started_at: string;
  ended_at: string | null;
  status: "active" | "completed" | "abandoned";
  review_focus: number | null; // 1-5
  review_progress: string | null;
  review_notes: string | null;
  created_at: string;
};

export type Impulse = {
  id: string;
  user_id: string;
  type:
    | "smoking"
    | "social_media"
    | "pornography"
    | "binge_eating"
    | "substance"
    | "other";
  intensity: number; // 1-10
  trigger: string | null;
  context: string | null;
  emotion_before: string | null;
  technique_used: string | null; // DBT technique
  resisted: boolean;
  notes: string | null;
  duration_minutes: number | null; // how long the impulse lasted before decision
  technique_effectiveness: number | null; // 1-5 how well the technique worked
  linked_value: string | null; // which ACT value was invoked
  recovery_entry_id: string | null; // if relapsed, link to recovery
  created_at: string;
};

export type WeeklyReview = {
  id: string;
  user_id: string;
  week_start: string; // YYYY-MM-DD (Monday)
  patterns: string | null;
  triggers: string | null;
  adjustments: string | null;
  wins: string | null;
  ai_insights: string | null;
  created_at: string;
};

// ACT Values - user's core values
export type UserValue = {
  id: string;
  user_id: string;
  name: string; // e.g., "Crescimento", "Saúde", "Conexão"
  description: string | null;
  icon: string | null; // emoji
  active: boolean;
  created_at: string;
  order_index: number;
};

// Technique Log - tracks which DBT technique was used and its effectiveness
export type TechniqueLog = {
  id: string;
  user_id: string;
  impulse_id: string | null; // linked to impulse that triggered it
  technique: string; // e.g., "tip", "stop", "grounding", "breathing", "opposite_action", "delay"
  context: "impulse" | "rescue" | "proactive"; // when was it used
  effectiveness: number | null; // 1-5 rating after use
  duration_seconds: number | null; // how long they engaged
  notes: string | null;
  created_at: string;
};

// Recovery Entry - tracks what happens after a relapse
export type RecoveryEntry = {
  id: string;
  user_id: string;
  impulse_id: string; // which impulse led to relapse
  trigger_analysis: string | null; // user's reflection on what caused it
  what_to_do_differently: string | null; // commitment for next time
  self_compassion_note: string | null; // kind message to self
  return_action: string | null; // first small action to get back on track
  created_at: string;
};

// Overload Event - tracks when anti-obsession system kicks in
export type OverloadEvent = {
  id: string;
  user_id: string;
  date: string;
  type: "auto_reduction" | "rescue_activated" | "priority_blocked" | "manual";
  anxiety_level: number | null;
  energy_level: number | null;
  tasks_before: number;
  tasks_after: number;
  notes: string | null;
  created_at: string;
};

// --------------- Insert types (server-generated fields are optional) ---------------

export type UserInsert = Omit<User, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};
export type CheckInInsert = Omit<CheckIn, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type IdentityInsert = Omit<Identity, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type HabitInsert = Omit<Habit, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type HabitLogInsert = Omit<HabitLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type DayPriorityInsert = Omit<DayPriority, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type FocusSessionInsert = Omit<FocusSession, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type ImpulseInsert = Omit<Impulse, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type WeeklyReviewInsert = Omit<WeeklyReview, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type UserValueInsert = Omit<UserValue, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type TechniqueLogInsert = Omit<TechniqueLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type RecoveryEntryInsert = Omit<RecoveryEntry, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
export type OverloadEventInsert = Omit<OverloadEvent, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

// --------------- Update types (all fields optional) ---------------

export type UserUpdate = Partial<User>;
export type CheckInUpdate = Partial<CheckIn>;
export type IdentityUpdate = Partial<Identity>;
export type HabitUpdate = Partial<Habit>;
export type HabitLogUpdate = Partial<HabitLog>;
export type DayPriorityUpdate = Partial<DayPriority>;
export type FocusSessionUpdate = Partial<FocusSession>;
export type ImpulseUpdate = Partial<Impulse>;
export type WeeklyReviewUpdate = Partial<WeeklyReview>;
export type UserValueUpdate = Partial<UserValue>;
export type TechniqueLogUpdate = Partial<TechniqueLog>;
export type RecoveryEntryUpdate = Partial<RecoveryEntry>;
export type OverloadEventUpdate = Partial<OverloadEvent>;

// --------------- Supabase Database type ---------------

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      check_ins: {
        Row: CheckIn;
        Insert: CheckInInsert;
        Update: CheckInUpdate;
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      identities: {
        Row: Identity;
        Insert: IdentityInsert;
        Update: IdentityUpdate;
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      habits: {
        Row: Habit;
        Insert: HabitInsert;
        Update: HabitUpdate;
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habits_identity_id_fkey";
            columns: ["identity_id"];
            referencedRelation: "identities";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_logs: {
        Row: HabitLog;
        Insert: HabitLogInsert;
        Update: HabitLogUpdate;
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey";
            columns: ["habit_id"];
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      day_priorities: {
        Row: DayPriority;
        Insert: DayPriorityInsert;
        Update: DayPriorityUpdate;
        Relationships: [
          {
            foreignKeyName: "day_priorities_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      focus_sessions: {
        Row: FocusSession;
        Insert: FocusSessionInsert;
        Update: FocusSessionUpdate;
        Relationships: [
          {
            foreignKeyName: "focus_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      impulses: {
        Row: Impulse;
        Insert: ImpulseInsert;
        Update: ImpulseUpdate;
        Relationships: [
          {
            foreignKeyName: "impulses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_reviews: {
        Row: WeeklyReview;
        Insert: WeeklyReviewInsert;
        Update: WeeklyReviewUpdate;
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_values: {
        Row: UserValue;
        Insert: UserValueInsert;
        Update: UserValueUpdate;
        Relationships: [
          {
            foreignKeyName: "user_values_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      technique_logs: {
        Row: TechniqueLog;
        Insert: TechniqueLogInsert;
        Update: TechniqueLogUpdate;
        Relationships: [
          {
            foreignKeyName: "technique_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "technique_logs_impulse_id_fkey";
            columns: ["impulse_id"];
            referencedRelation: "impulses";
            referencedColumns: ["id"];
          },
        ];
      };
      recovery_entries: {
        Row: RecoveryEntry;
        Insert: RecoveryEntryInsert;
        Update: RecoveryEntryUpdate;
        Relationships: [
          {
            foreignKeyName: "recovery_entries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recovery_entries_impulse_id_fkey";
            columns: ["impulse_id"];
            referencedRelation: "impulses";
            referencedColumns: ["id"];
          },
        ];
      };
      overload_events: {
        Row: OverloadEvent;
        Insert: OverloadEventInsert;
        Update: OverloadEventUpdate;
        Relationships: [
          {
            foreignKeyName: "overload_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      habit_frequency: "daily" | "weekdays" | "custom";
      habit_log_version: "ideal" | "minimum" | "skipped";
      focus_session_status: "active" | "completed" | "abandoned";
      impulse_type:
        | "smoking"
        | "social_media"
        | "pornography"
        | "binge_eating"
        | "substance"
        | "other";
      technique_context: "impulse" | "rescue" | "proactive";
      overload_event_type:
        | "auto_reduction"
        | "rescue_activated"
        | "priority_blocked"
        | "manual";
    };
  };
};
