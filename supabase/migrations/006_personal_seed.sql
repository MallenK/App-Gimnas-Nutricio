-- =============================================
-- GymNutricio — Personal seed (Sergi Mallén López)
-- Run in Supabase SQL Editor AFTER logging in at least once.
-- Safe to re-run: all inserts are idempotent.
-- =============================================

DO $$
DECLARE
  v_user_id            UUID;
  v_routine_id         UUID;
  v_day_piernas_id     UUID;
  v_day_torso_mie_id   UUID;
  v_day_torso_vie_id   UUID;
  v_ex_leg_press       UUID;
  v_ex_ext_cuad        UUID;
  v_ex_press_maq_pecho UUID;
  v_ex_press_inclinado UUID;
  v_ex_fly_maquina     UUID;
  v_ex_press_hombros   UUID;
  v_ex_jalon           UUID;
  v_ex_press_triceps   UUID;
  v_ex_crunch          UUID;
  v_ex_bici            UUID;
BEGIN

  -- ── Resolve user ─────────────────────────────────────────────────────────
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found — log in once before running this script.';
  END IF;

  -- ── 1. Profile ────────────────────────────────────────────────────────────
  INSERT INTO profiles (id, full_name)
  VALUES (v_user_id, 'Sergi Mallén López')
  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        updated_at = NOW();

  -- ── 2. Goals ──────────────────────────────────────────────────────────────
  -- 2000 kcal cutting: 40% P (~200g), 35% C (~175g), 25% F (~56g)
  INSERT INTO user_goals (
    user_id, target_weight_kg, current_weight_kg,
    daily_calories, protein_pct, carbs_pct, fat_pct,
    daily_steps_target, weekly_workouts_target
  ) VALUES (
    v_user_id, 80, 87,
    2000, 40, 35, 25,
    10000, 3
  )
  ON CONFLICT (user_id) DO UPDATE SET
    target_weight_kg       = 80,
    current_weight_kg      = 87,
    daily_calories         = 2000,
    protein_pct            = 40,
    carbs_pct              = 35,
    fat_pct                = 25,
    daily_steps_target     = 10000,
    weekly_workouts_target = 3,
    updated_at             = NOW();

  -- ── 3. Finance config ─────────────────────────────────────────────────────
  INSERT INTO finance_config (user_id, monthly_budget, currency)
  VALUES (v_user_id, 1605.00, 'EUR')
  ON CONFLICT (user_id) DO UPDATE SET
    monthly_budget = 1605.00,
    currency       = 'EUR',
    updated_at     = NOW();

  -- ── 4. Starting body weight ───────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM body_metrics
    WHERE user_id = v_user_id AND measured_at = '2026-05-19'
  ) THEN
    INSERT INTO body_metrics (user_id, measured_at, weight_kg)
    VALUES (v_user_id, '2026-05-19', 87.0);
  END IF;

  -- ── 5. Habits ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM habits WHERE user_id = v_user_id) THEN
    INSERT INTO habits (user_id, name, icon, color, target_value, target_unit, recurrence, sort_order)
    VALUES
      (v_user_id, 'Agua',  '💧', '#06b6d4', 2,     'litros', 'daily', 0),
      (v_user_id, 'Sueño', '😴', '#8b5cf6', 8,     'horas',  'daily', 1),
      (v_user_id, 'Pasos', '👟', '#10b981', 10000, 'pasos',  'daily', 2);
  END IF;

  -- ── 6. Resolve exercises from built-in seed ───────────────────────────────
  SELECT id INTO v_ex_leg_press
    FROM exercises WHERE name = 'Prensa de piernas' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_ext_cuad
    FROM exercises WHERE name = 'Extensión de cuádriceps' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_press_maq_pecho
    FROM exercises WHERE name = 'Press en máquina pecho' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_press_inclinado
    FROM exercises WHERE name = 'Press de banca inclinado' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_press_hombros
    FROM exercises WHERE name = 'Press de hombros con mancuernas' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_jalon
    FROM exercises WHERE name = 'Jalón al pecho' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_press_triceps
    FROM exercises WHERE name = 'Extensión de tríceps en polea' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_crunch
    FROM exercises WHERE name = 'Crunch abdominal' AND user_id IS NULL LIMIT 1;

  SELECT id INTO v_ex_bici
    FROM exercises WHERE name = 'Bicicleta estática' AND user_id IS NULL LIMIT 1;

  -- Fly en máquina — not in built-in seed, create as custom
  SELECT id INTO v_ex_fly_maquina
    FROM exercises WHERE name = 'Fly en máquina' AND user_id = v_user_id LIMIT 1;

  IF v_ex_fly_maquina IS NULL THEN
    INSERT INTO exercises (user_id, name, muscle_group, category, equipment, is_custom)
    VALUES (v_user_id, 'Fly en máquina', 'chest', 'strength', 'machine', true)
    RETURNING id INTO v_ex_fly_maquina;
  END IF;

  -- ── 7. Workout routine ────────────────────────────────────────────────────
  SELECT id INTO v_routine_id
    FROM workout_routines
    WHERE user_id = v_user_id AND name = 'Mi Rutina L/X/V'
    LIMIT 1;

  IF v_routine_id IS NULL THEN

    INSERT INTO workout_routines (user_id, name, description, is_active)
    VALUES (
      v_user_id,
      'Mi Rutina L/X/V',
      'Lunes: Piernas · Miércoles: Torso + Abs + Bici · Viernes: Torso + Abs + Bici',
      true
    )
    RETURNING id INTO v_routine_id;

    -- Day A — Piernas (Monday = 0)
    INSERT INTO routine_days (routine_id, name, day_of_week, sort_order)
    VALUES (v_routine_id, 'Piernas', 0, 0)
    RETURNING id INTO v_day_piernas_id;

    -- Day B — Torso (Wednesday = 2)
    INSERT INTO routine_days (routine_id, name, day_of_week, sort_order)
    VALUES (v_routine_id, 'Torso', 2, 1)
    RETURNING id INTO v_day_torso_mie_id;

    -- Day C — Torso (Friday = 4)
    INSERT INTO routine_days (routine_id, name, day_of_week, sort_order)
    VALUES (v_routine_id, 'Torso', 4, 2)
    RETURNING id INTO v_day_torso_vie_id;

    -- Piernas: Leg Press + Extensión cuádriceps
    INSERT INTO routine_exercises
      (routine_day_id, exercise_id, sort_order, sets, reps_min, reps_max, rest_seconds)
    VALUES
      (v_day_piernas_id, v_ex_leg_press,  0, 4, 8,  12, 90),
      (v_day_piernas_id, v_ex_ext_cuad,   1, 3, 12, 15, 60);

    -- Torso Miércoles
    INSERT INTO routine_exercises
      (routine_day_id, exercise_id, sort_order, sets, reps_min, reps_max, rest_seconds, notes)
    VALUES
      (v_day_torso_mie_id, v_ex_press_maq_pecho, 0, 4, 8,    12,   90,   NULL),
      (v_day_torso_mie_id, v_ex_press_inclinado,  1, 3, 10,   12,   90,   NULL),
      (v_day_torso_mie_id, v_ex_fly_maquina,      2, 3, 12,   15,   60,   NULL),
      (v_day_torso_mie_id, v_ex_press_hombros,    3, 3, 10,   12,   90,   NULL),
      (v_day_torso_mie_id, v_ex_jalon,            4, 4, 10,   12,   90,   NULL),
      (v_day_torso_mie_id, v_ex_press_triceps,    5, 3, 12,   15,   60,   NULL),
      (v_day_torso_mie_id, v_ex_crunch,           6, 3, 15,   20,   45,   NULL),
      (v_day_torso_mie_id, v_ex_bici,             7, 1, NULL, NULL, NULL, '20 min');

    -- Torso Viernes (same as Miércoles)
    INSERT INTO routine_exercises
      (routine_day_id, exercise_id, sort_order, sets, reps_min, reps_max, rest_seconds, notes)
    VALUES
      (v_day_torso_vie_id, v_ex_press_maq_pecho, 0, 4, 8,    12,   90,   NULL),
      (v_day_torso_vie_id, v_ex_press_inclinado,  1, 3, 10,   12,   90,   NULL),
      (v_day_torso_vie_id, v_ex_fly_maquina,      2, 3, 12,   15,   60,   NULL),
      (v_day_torso_vie_id, v_ex_press_hombros,    3, 3, 10,   12,   90,   NULL),
      (v_day_torso_vie_id, v_ex_jalon,            4, 4, 10,   12,   90,   NULL),
      (v_day_torso_vie_id, v_ex_press_triceps,    5, 3, 12,   15,   60,   NULL),
      (v_day_torso_vie_id, v_ex_crunch,           6, 3, 15,   20,   45,   NULL),
      (v_day_torso_vie_id, v_ex_bici,             7, 1, NULL, NULL, NULL, '20 min');

  END IF;

  RAISE NOTICE 'Seed completed for user: %', v_user_id;

END $$;
