import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { MonthSummary } from '@/types/finances'

interface FinanceSummaryCardProps {
  summary: MonthSummary
  currency?: string
}

function fmt(n: number, currency = 'EUR') {
  return n.toLocaleString('es-ES', { style: 'currency', currency, maximumFractionDigits: 2 })
}

export function FinanceSummaryCard({ summary, currency = 'EUR' }: FinanceSummaryCardProps) {
  const navigate = useNavigate()
  const { totalExpenses, totalIncome, monthlyBudget, balance } = summary
  const totalAvailable = monthlyBudget + totalIncome
  const spentPct = totalAvailable > 0 ? Math.min((totalExpenses / totalAvailable) * 100, 100) : 0
  const isOver = totalExpenses > totalAvailable
  const hasConfig = monthlyBudget > 0

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 space-y-4">
      {/* Balance */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Balance del mes</p>
          <p className={cn('text-3xl font-bold', balance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {fmt(balance, currency)}
          </p>
        </div>
        {!hasConfig && (
          <button
            onClick={() => navigate('/finances/config')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs hover:bg-violet-500/20 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar saldo
          </button>
        )}
      </div>

      {/* 3-col stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          label="Saldo fijo"
          value={fmt(monthlyBudget, currency)}
          color="text-slate-300"
          icon="📅"
        />
        <StatBox
          label="Ingresos extra"
          value={fmt(totalIncome, currency)}
          color="text-emerald-400"
          icon="💰"
        />
        <StatBox
          label="Gastos"
          value={fmt(totalExpenses, currency)}
          color="text-red-400"
          icon="💸"
        />
      </div>

      {/* Spent progress bar */}
      {hasConfig && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{fmt(totalExpenses, currency)} gastado</span>
            <span>de {fmt(totalAvailable, currency)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', isOver ? 'bg-red-500' : 'bg-violet-500')}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/30 p-2.5 text-center">
      <p className="text-base mb-0.5">{icon}</p>
      <p className={cn('text-sm font-bold', color)}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
