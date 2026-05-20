import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Wallet } from 'lucide-react'
import { useFinanceConfig, useUpsertFinanceConfig } from '@/hooks/finances/useFinances'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  monthly_budget: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Debe ser ≥ 0'),
  currency: z.string().min(3).max(3),
})
type FormValues = z.infer<typeof schema>

const CURRENCIES = [
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'USD', label: 'Dólar ($)' },
  { code: 'GBP', label: 'Libra (£)' },
]

export function FinancesConfigPage() {
  const { data: config, isLoading } = useFinanceConfig()
  const upsert = useUpsertFinanceConfig()
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { monthly_budget: '0', currency: 'EUR' },
  })

  useEffect(() => {
    if (config) {
      reset({ monthly_budget: String(config.monthly_budget), currency: config.currency })
    }
  }, [config, reset])

  async function onSubmit(values: FormValues) {
    await upsert.mutateAsync({
      monthly_budget: parseFloat(values.monthly_budget),
      currency: values.currency,
    })
    toast({ title: 'Configuración guardada' })
  }

  const selectedCurrency = watch('currency')

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-violet-400" />
        <h1 className="font-bold text-base">Configuración financiera</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-6 space-y-6">
          {/* Monthly budget */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 space-y-4">
            <h2 className="font-semibold text-sm text-slate-300">Saldo mensual fijo</h2>
            <p className="text-xs text-slate-400">
              Tu sueldo u otros ingresos recurrentes mensuales. Base para calcular el balance.
            </p>
            <div className="space-y-1.5">
              <Label>Importe mensual</Label>
              <div className="relative">
                <Input
                  {...register('monthly_budget')}
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-slate-800 border-slate-600 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {selectedCurrency === 'EUR' ? '€' : selectedCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-slate-300">Moneda</h2>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setValue('currency', c.code)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    selectedCurrency === c.code
                      ? 'bg-violet-500/20 border-violet-500 text-violet-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="finances"
            className="w-full h-12 text-base font-semibold"
            disabled={upsert.isPending}
          >
            {upsert.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar configuración'}
          </Button>
        </form>
      )}
    </div>
  )
}
