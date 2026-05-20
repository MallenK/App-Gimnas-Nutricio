-- =============================================
-- GymNutricio - Reset + Full Setup
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- DROP everything
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS body_metrics CASCADE;
DROP TABLE IF EXISTS cardio_logs CASCADE;
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS mesocycles CASCADE;
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS routine_days CASCADE;
DROP TABLE IF EXISTS workout_routines CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS meal_plan_entries CASCADE;
DROP TABLE IF EXISTS meal_plan_templates CASCADE;
DROP TABLE IF EXISTS meal_logs CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_goals (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  target_weight_kg       NUMERIC(5,2),
  current_weight_kg      NUMERIC(5,2),
  daily_calories         INTEGER,
  protein_pct            NUMERIC(4,1) DEFAULT 30,
  carbs_pct              NUMERIC(4,1) DEFAULT 40,
  fat_pct                NUMERIC(4,1) DEFAULT 30,
  daily_steps_target     INTEGER DEFAULT 10000,
  weekly_workouts_target INTEGER DEFAULT 3,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE foods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  off_id            TEXT,
  name              TEXT NOT NULL,
  brand             TEXT,
  serving_size_g    NUMERIC(7,2) NOT NULL DEFAULT 100,
  serving_unit      TEXT DEFAULT 'g',
  calories_per_100g NUMERIC(7,2) NOT NULL,
  protein_per_100g  NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g    NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_per_100g      NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_per_100g    NUMERIC(6,2),
  sugar_per_100g    NUMERIC(6,2),
  sodium_per_100g   NUMERIC(6,2),
  is_custom         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_foods_off_id ON foods(off_id) WHERE off_id IS NOT NULL;

CREATE TABLE meal_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id    UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  log_date   DATE NOT NULL,
  meal_type  TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity_g NUMERIC(7,2) NOT NULL,
  calories   NUMERIC(7,2) NOT NULL,
  protein_g  NUMERIC(6,2) NOT NULL,
  carbs_g    NUMERIC(6,2) NOT NULL,
  fat_g      NUMERIC(6,2) NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meal_plan_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meal_plan_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_template_id UUID NOT NULL REFERENCES meal_plan_templates(id) ON DELETE CASCADE,
  food_id               UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  day_of_week           INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  meal_type             TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity_g            NUMERIC(7,2) NOT NULL
);

CREATE TABLE exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'strength'
               CHECK(category IN ('strength','cardio','bodyweight','stretching')),
  equipment    TEXT,
  instructions TEXT,
  is_custom    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_routines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE routine_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id  UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  day_of_week INTEGER CHECK(day_of_week BETWEEN 0 AND 6),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE routine_exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id UUID NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id    UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  sets           INTEGER NOT NULL DEFAULT 3,
  reps_min       INTEGER,
  reps_max       INTEGER,
  rest_seconds   INTEGER DEFAULT 90,
  notes          TEXT
);

CREATE TABLE mesocycles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id     UUID REFERENCES workout_routines(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  goal           TEXT CHECK(goal IN ('hypertrophy','strength','endurance','cut','recomp')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_day_id   UUID REFERENCES routine_days(id) ON DELETE SET NULL,
  mesocycle_id     UUID REFERENCES mesocycles(id) ON DELETE SET NULL,
  session_date     DATE NOT NULL,
  start_time       TIMESTAMPTZ,
  end_time         TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes            TEXT,
  perceived_effort INTEGER CHECK(perceived_effort BETWEEN 1 AND 10),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_sets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id        UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  set_number         INTEGER NOT NULL,
  reps               INTEGER,
  weight_kg          NUMERIC(6,2),
  duration_seconds   INTEGER,
  distance_km        NUMERIC(7,3),
  is_warmup          BOOLEAN NOT NULL DEFAULT FALSE,
  rpe                NUMERIC(3,1) CHECK(rpe BETWEEN 1 AND 10),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cardio_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date         DATE NOT NULL,
  activity_type    TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  distance_km      NUMERIC(7,3),
  calories_burned  INTEGER,
  steps            INTEGER,
  avg_heart_rate   INTEGER,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_metrics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at  DATE NOT NULL,
  weight_kg    NUMERIC(5,2),
  body_fat_pct NUMERIC(4,1),
  waist_cm     NUMERIC(5,1),
  chest_cm     NUMERIC(5,1),
  hip_cm       NUMERIC(5,1),
  arm_cm       NUMERIC(5,1),
  thigh_cm     NUMERIC(5,1),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  icon            TEXT,
  color           TEXT,
  target_value    NUMERIC(7,2),
  target_unit     TEXT,
  recurrence      TEXT NOT NULL DEFAULT 'daily'
                  CHECK(recurrence IN ('daily','weekdays','weekends','custom')),
  recurrence_days INTEGER[],
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id     UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  value        NUMERIC(7,2),
  completed_at TIMESTAMPTZ,
  UNIQUE(habit_id, log_date)
);

CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  period_type   TEXT NOT NULL CHECK(period_type IN ('weekly','monthly','custom')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  category      TEXT NOT NULL CHECK(category IN ('nutrition','fitness','body','habit','other')),
  target_value  NUMERIC(10,2),
  target_unit   TEXT,
  current_value NUMERIC(10,2) DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK(status IN ('active','completed','failed','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises            ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines     ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days         ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardio_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- user_goals
CREATE POLICY "user_goals_all" ON user_goals FOR ALL USING (auth.uid() = user_id);

-- foods (NULL user_id = shared/built-in, readable by all)
CREATE POLICY "foods_select" ON foods FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "foods_insert" ON foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "foods_update" ON foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "foods_delete" ON foods FOR DELETE USING (auth.uid() = user_id);

-- meal_logs
CREATE POLICY "meal_logs_all" ON meal_logs FOR ALL USING (auth.uid() = user_id);

-- meal_plan_templates
CREATE POLICY "meal_plan_templates_all" ON meal_plan_templates FOR ALL USING (auth.uid() = user_id);

-- meal_plan_entries
CREATE POLICY "meal_plan_entries_all" ON meal_plan_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM meal_plan_templates t
    WHERE t.id = meal_plan_entries.meal_plan_template_id AND t.user_id = auth.uid()
  ));

-- exercises (NULL user_id = built-in, readable by all)
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update" ON exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete" ON exercises FOR DELETE USING (auth.uid() = user_id);

-- workout_routines
CREATE POLICY "workout_routines_all" ON workout_routines FOR ALL USING (auth.uid() = user_id);

-- routine_days
CREATE POLICY "routine_days_all" ON routine_days FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workout_routines r
    WHERE r.id = routine_days.routine_id AND r.user_id = auth.uid()
  ));

-- routine_exercises
CREATE POLICY "routine_exercises_all" ON routine_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM routine_days rd
    JOIN workout_routines r ON r.id = rd.routine_id
    WHERE rd.id = routine_exercises.routine_day_id AND r.user_id = auth.uid()
  ));

-- mesocycles
CREATE POLICY "mesocycles_all" ON mesocycles FOR ALL USING (auth.uid() = user_id);

-- workout_sessions
CREATE POLICY "workout_sessions_all" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- workout_sets
CREATE POLICY "workout_sets_all" ON workout_sets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = workout_sets.workout_session_id AND ws.user_id = auth.uid()
  ));

-- cardio_logs
CREATE POLICY "cardio_logs_all" ON cardio_logs FOR ALL USING (auth.uid() = user_id);

-- body_metrics
CREATE POLICY "body_metrics_all" ON body_metrics FOR ALL USING (auth.uid() = user_id);

-- habits
CREATE POLICY "habits_all" ON habits FOR ALL USING (auth.uid() = user_id);

-- habit_logs
CREATE POLICY "habit_logs_all" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- goals
CREATE POLICY "goals_all" ON goals FOR ALL USING (auth.uid() = user_id);
