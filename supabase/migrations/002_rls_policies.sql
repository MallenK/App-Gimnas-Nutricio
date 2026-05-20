-- =============================================
-- GymNutricio - Row Level Security Policies
-- =============================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- user_goals
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_goals_all_own" ON user_goals FOR ALL USING (auth.uid() = user_id);

-- foods: shared (user_id IS NULL) are readable by all; custom only by owner
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_select" ON foods
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "foods_insert_own" ON foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "foods_update_own" ON foods
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "foods_delete_own" ON foods
  FOR DELETE USING (auth.uid() = user_id);

-- meal_logs
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_logs_all_own" ON meal_logs FOR ALL USING (auth.uid() = user_id);

-- meal_plan_templates
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_templates_all_own" ON meal_plan_templates FOR ALL USING (auth.uid() = user_id);

-- meal_plan_entries (access via template ownership)
ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_entries_all" ON meal_plan_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plan_templates t
      WHERE t.id = meal_plan_entries.meal_plan_template_id
      AND t.user_id = auth.uid()
    )
  );

-- exercises: shared (user_id IS NULL) readable by all; custom only by owner
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises_select" ON exercises
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "exercises_insert_own" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update_own" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete_own" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- workout_routines
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_routines_all_own" ON workout_routines FOR ALL USING (auth.uid() = user_id);

-- routine_days (access via routine ownership)
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routine_days_all" ON routine_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_routines r
      WHERE r.id = routine_days.routine_id
      AND r.user_id = auth.uid()
    )
  );

-- routine_exercises (access via routine_day → routine ownership)
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routine_exercises_all" ON routine_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM routine_days rd
      JOIN workout_routines r ON r.id = rd.routine_id
      WHERE rd.id = routine_exercises.routine_day_id
      AND r.user_id = auth.uid()
    )
  );

-- mesocycles
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesocycles_all_own" ON mesocycles FOR ALL USING (auth.uid() = user_id);

-- workout_sessions
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_sessions_all_own" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- workout_sets (access via session ownership)
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_sets_all" ON workout_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sets.workout_session_id
      AND ws.user_id = auth.uid()
    )
  );

-- cardio_logs
ALTER TABLE cardio_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cardio_logs_all_own" ON cardio_logs FOR ALL USING (auth.uid() = user_id);

-- body_metrics
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "body_metrics_all_own" ON body_metrics FOR ALL USING (auth.uid() = user_id);

-- habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_all_own" ON habits FOR ALL USING (auth.uid() = user_id);

-- habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_all_own" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_all_own" ON goals FOR ALL USING (auth.uid() = user_id);
