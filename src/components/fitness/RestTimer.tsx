import { useEffect, useState } from 'react'
import { X, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RestTimerProps {
  seconds: number
  onComplete?: () => void
  onDismiss: () => void
}

export function RestTimer({ seconds: initialSeconds, onComplete, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    setRemaining(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.()
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, onComplete])

  const pct = ((initialSeconds - remaining) / initialSeconds) * 100
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-72">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="rounded-2xl bg-slate-800 border border-slate-600 shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-700">
          <div
            className={cn('h-full transition-all duration-1000', remaining <= 10 ? 'bg-red-500' : 'bg-orange-500')}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">Descanso</p>
            <p className={cn('text-2xl font-bold font-mono', remaining <= 10 ? 'text-red-400' : 'text-orange-400')}>
              {minutes > 0 ? `${minutes}:${String(secs).padStart(2, '0')}` : `${secs}s`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Saltar
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function RestTimerOverlay({ visible, ...props }: RestTimerProps & { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && <RestTimer {...props} />}
    </AnimatePresence>
  )
}
