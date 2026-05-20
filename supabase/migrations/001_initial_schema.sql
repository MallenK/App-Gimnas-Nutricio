-- =============================================
-- GymNutricio - Initial Schema
-- =============================================

-- =============================================
-- AUTH / USER
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_goals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  target_weight_kg        NUMERIC(5,2),
  current_weight_kg       NUMERIC(5,2),
  daily_calories          INTEGER,
  protein_pct             NUMERIC(4,1) DEFAULT 30,
  carbs_pct               NUMERIC(4,1) DEFAULT 40,
  fat_pct                 NUMERIC(4,1) DEFAULT 30,
  daily_steps_target      INTEGER DEFAULT 10000,
  weekly_workouts_target  INTEGER DEFAULT 3,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NUTRITION
-- =============================================

CREATE TABLE IF NOT EXISTS foods (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  off_id              TEXT UNIQUE,
  name                TEXT NOT NULL,
  brand               TEXT,
  serving_size_g      NUMERIC(7,2) NOT NULL DEFAULT 100,
  serving_unit        TEXT DEFAULT 'g',
  calories_per_100g   NUMERIC(7,2) NOT NULL,
  protein_per_100g    NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g      NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_per_100g        NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_per_100g      NUMERIC(6,2),
  sugar_per_100g      NUMERIC(6,2),
  sodium_per_100g     NUMERIC(6,2),
  is_custom           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_user ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods USING gin(to_tsvector('simple', name));

CREATE TABLE IF NOT EXISTS meal_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  log_date    DATE NOT NULL,
  meal_type   TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity_g  NUMERIC(7,2) NOT NULL,
  calories    NUMERIC(7,2) NOT NULL,
  protein_g   NUMERIC(6,2) NOT NULL,
  carbs_g     NUMERIC(6,2) NOT NULL,
  fat_g       NUMERIC(6,2) NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_meal ON meal_logs(user_id, log_date, meal_type);

CREATE TABLE IF NOT EXISTS meal_plan_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_templates_user ON meal_plan_templates(user_id);

CREATE TABLE IF NOT EXISTS meal_plan_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_template_id UUID NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
  food_id               UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  day_of_week           INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  meal_type             TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity_g            NUMERIC(7,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_entries_template ON meal_plan_entries(meal_plan_template_id, day_of_week);

-- =============================================
-- FITNESS
-- =============================================

CREATE TABLE IF NOT EXISTS exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  muscle_group  TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'strength'
                CHECK(category IN ('strength','cardio','bodyweight','stretching')),
  equipment     TEXT,
  instructions  TEXT,
  is_custom     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);

CREATE TABLE IF NOT EXISTS workout_routines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_routines_user ON workout_routines(user_id);

CREATE TABLE IF NOT EXISTS routine_days (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  day_of_week  INTEGER CHECK(day_of_week BETWEEN 0 AND 6),
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_routine_days_routine ON routine_days(routine_id);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id   UUID NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id      UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  sets             INTEGER NOT NULL DEFAULT 3,
  reps_min         INTEGER,
  reps_max         INTEGER,
  rest_seconds     INTEGER DEFAULT 90,
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_day ON routine_exercises(routine_day_id);

CREATE TABLE IF NOT EXISTS mesocycles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id      UUID REFERENCES workout_routines(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  duration_weeks  INTEGER NOT NULL DEFAULT 4,
  goal            TEXT CHECK(goal IN ('hypertrophy','strength','endurance','cut','recomp')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mesocycles_user_date ON mesocycles(user_id, start_date);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_day_id    UUID REFERENCES routine_days(id) ON DELETE SET NULL,
  mesocycle_id      UUID REFERENCES mesocycles(id) ON DELETE SET NULL,
  session_date      DATE NOT NULL,
  start_time        TIMESTAMPTZ,
  end_time          TIMESTAMPTZ,
  duration_minutes  INTEGER,
  notes             TEXT,
  perceived_effort  INTEGER CHECK(perceived_effort BETWEEN 1 AND 10),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_cycle ON workout_sessions(user_id, mesocycle_id);

CREATE TABLE IF NOT EXISTS workout_sets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id  UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  set_number          INTEGER NOT NULL,
  reps                INTEGER,
  weight_kg           NUMERIC(6,2),
  duration_seconds    INTEGER,
  distance_km         NUMERIC(7,3),
  is_warmup           BOOLEAN NOT NULL DEFAULT FALSE,
  rpe                 NUMERIC(3,1) CHECK(rpe BETWEEN 1 AND 10),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(exercise_id);

CREATE TABLE IF NOT EXISTS cardio_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date          DATE NOT NULL,
  activity_type     TEXT NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  distance_km       NUMERIC(7,3),
  calories_burned   INTEGER,
  steps             INTEGER,
  avg_heart_rate    INTEGER,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cardio_logs_user_date ON cardio_logs(user_id, log_date);

CREATE TABLE IF NOT EXISTS body_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at   DATE NOT NULL,
  weight_kg     NUMERIC(5,2),
  body_fat_pct  NUMERIC(4,1),
  waist_cm      NUMERIC(5,1),
  chest_cm      NUMERIC(5,1),
  hip_cm        NUMERIC(5,1),
  arm_cm        NUMERIC(5,1),
  thigh_cm      NUMERIC(5,1),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, measured_at);

-- =============================================
-- TASKS
-- =============================================

CREATE TABLE IF NOT EXISTS habits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  icon             TEXT,
  color            TEXT,
  target_value     NUMERIC(7,2),
  target_unit      TEXT,
  recurrence       TEXT NOT NULL DEFAULT 'daily'
                   CHECK(recurrence IN ('daily','weekdays','weekends','custom')),
  recurrence_days  INTEGER[],
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);

CREATE TABLE IF NOT EXISTS habit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id     UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  value        NUMERIC(7,2),
  completed_at TIMESTAMPTZ,
  UNIQUE(habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);

CREATE TABLE IF NOT EXISTS goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  period_type    TEXT NOT NULL CHECK(period_type IN ('weekly','monthly','custom')),
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  category       TEXT NOT NULL CHECK(category IN ('nutrition','fitness','body','habit','other')),
  target_value   NUMERIC(10,2),
  target_unit    TEXT,
  current_value  NUMERIC(10,2) DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK(status IN ('active','completed','failed','cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_dates ON goals(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

-- Triggers (updated_at) are set up separately via Supabase Dashboard
-- or via migration 004_triggers.sql after tables are confirmed working
