import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useAuthInit } from '@/hooks/auth/useAuth'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

import { LoginPage } from '@/pages/auth/LoginPage'
import { CallbackPage } from '@/pages/auth/CallbackPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

import { FoodLogPage } from '@/pages/nutrition/FoodLogPage'
import { MealPlannerPage } from '@/pages/nutrition/MealPlannerPage'
import { FoodLibraryPage } from '@/pages/nutrition/FoodLibraryPage'
import { NutritionGoalsPage } from '@/pages/nutrition/NutritionGoalsPage'

import { WorkoutLogPage } from '@/pages/fitness/WorkoutLogPage'
import { ActiveWorkoutPage } from '@/pages/fitness/ActiveWorkoutPage'
import { RoutinePlannerPage } from '@/pages/fitness/RoutinePlannerPage'
import { MesocyclesPage } from '@/pages/fitness/MesocyclesPage'
import { ProgressPage } from '@/pages/fitness/ProgressPage'
import { CardioPage } from '@/pages/fitness/CardioPage'

import { DailyHabitsPage } from '@/pages/tasks/DailyHabitsPage'
import { GoalsPage } from '@/pages/tasks/GoalsPage'

import { SettingsPage } from '@/pages/settings/SettingsPage'
import { GoalsSettingsPage } from '@/pages/settings/GoalsSettingsPage'

import { FinancesLogPage } from '@/pages/finances/FinancesLogPage'
import { FinancesBudgetPage } from '@/pages/finances/FinancesBudgetPage'
import { FinancesConfigPage } from '@/pages/finances/FinancesConfigPage'

function AppRoutes() {
  useAuthInit()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Nutrition */}
        <Route path="/nutrition" element={<Navigate to="/nutrition/log" replace />} />
        <Route path="/nutrition/log" element={<FoodLogPage />} />
        <Route path="/nutrition/log/:date" element={<FoodLogPage />} />
        <Route path="/nutrition/planner" element={<MealPlannerPage />} />
        <Route path="/nutrition/library" element={<FoodLibraryPage />} />
        <Route path="/nutrition/goals" element={<NutritionGoalsPage />} />

        {/* Fitness */}
        <Route path="/fitness" element={<Navigate to="/fitness/log" replace />} />
        <Route path="/fitness/log" element={<WorkoutLogPage />} />
        <Route path="/fitness/workout/new" element={<ActiveWorkoutPage />} />
        <Route path="/fitness/workout/active" element={<ActiveWorkoutPage />} />
        <Route path="/fitness/workout/:id" element={<WorkoutLogPage />} />
        <Route path="/fitness/routines" element={<RoutinePlannerPage />} />
        <Route path="/fitness/routines/:id" element={<RoutinePlannerPage />} />
        <Route path="/fitness/mesocycles" element={<MesocyclesPage />} />
        <Route path="/fitness/progress" element={<ProgressPage />} />
        <Route path="/fitness/cardio" element={<CardioPage />} />

        {/* Tasks */}
        <Route path="/tasks" element={<Navigate to="/tasks/habits" replace />} />
        <Route path="/tasks/habits" element={<DailyHabitsPage />} />
        <Route path="/tasks/habits/:date" element={<DailyHabitsPage />} />
        <Route path="/tasks/goals" element={<GoalsPage />} />

        {/* Finances */}
        <Route path="/finances" element={<Navigate to="/finances/log" replace />} />
        <Route path="/finances/log" element={<FinancesLogPage />} />
        <Route path="/finances/budget" element={<FinancesBudgetPage />} />
        <Route path="/finances/config" element={<FinancesConfigPage />} />

        {/* Settings */}
        <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="/settings/profile" element={<SettingsPage />} />
        <Route path="/settings/goals" element={<GoalsSettingsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
