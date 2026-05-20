-- =============================================
-- GymNutricio - Finances Module
-- Run AFTER 000_reset_and_setup.sql
-- =============================================

-- finance_config: one row per user (fixed monthly budget + currency)
CREATE TABLE IF NOT EXISTS finance_config (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_budget NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'EUR',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- expense_categories: built-in (user_id=NULL) + custom
CREATE TABLE IF NOT EXISTS expense_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  icon           TEXT,
  color          TEXT NOT NULL DEFAULT '#6366f1',
  monthly_budget NUMERIC(10,2),
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_custom      BOOLEAN NOT NULL DEFAULT FALSE
);

-- expenses: individual expense entries
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount       NUMERIC(10,2) NOT NULL,
  description  TEXT,
  expense_date DATE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- income_entries: occasional / punctual income
CREATE TABLE IF NOT EXISTS income_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  description TEXT,
  income_date DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income_entries(user_id, income_date);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user ON expense_categories(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE finance_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_config_all" ON finance_config FOR ALL USING (auth.uid() = user_id);

-- categories: NULL user_id = built-in readable by all, custom = own
CREATE POLICY "expense_categories_select" ON expense_categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "expense_categories_insert" ON expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expense_categories_update" ON expense_categories FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "expense_categories_delete" ON expense_categories FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "expenses_all"       ON expenses       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "income_entries_all" ON income_entries FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED: Built-in expense categories
-- =============================================

INSERT INTO expense_categories (user_id, name, icon, color, sort_order, is_custom) VALUES
  (NULL, 'Alimentación',   '🛒', '#10b981', 0,  false),
  (NULL, 'Restaurantes',   '🍽️', '#ef4444', 1,  false),
  (NULL, 'Transporte',     '🚗', '#3b82f6', 2,  false),
  (NULL, 'Hogar',          '🏠', '#f97316', 3,  false),
  (NULL, 'Salud',          '💊', '#ec4899', 4,  false),
  (NULL, 'Ocio',           '🎮', '#8b5cf6', 5,  false),
  (NULL, 'Ropa',           '👕', '#eab308', 6,  false),
  (NULL, 'Suscripciones',  '📱', '#06b6d4', 7,  false),
  (NULL, 'Deportes',       '🏋️', '#f97316', 8,  false),
  (NULL, 'Educación',      '📚', '#6366f1', 9,  false),
  (NULL, 'Viajes',         '✈️', '#14b8a6', 10, false),
  (NULL, 'Otros',          '📦', '#64748b', 11, false)
ON CONFLICT DO NOTHING;
