interface MacroRingProps {
  calories: number
  targetCalories: number
  proteinG: number
  carbsG: number
  fatG: number
}

const SIZE = 200
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R = 84
const INNER_R = 64
const OUTER_STROKE = 11
const INNER_STROKE = 14
const GAP = 5

export function MacroRing({ calories, targetCalories, proteinG, carbsG, fatG }: MacroRingProps) {
  const outerCirc = 2 * Math.PI * OUTER_R
  const innerCirc = 2 * Math.PI * INNER_R

  const calPct = targetCalories > 0 ? Math.min(calories / targetCalories, 1) : 0
  const calDash = outerCirc * calPct

  const proteinKcal = proteinG * 4
  const carbsKcal = carbsG * 4
  const fatKcal = fatG * 9
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1

  const available = innerCirc - GAP * 3
  const proteinLen = (proteinKcal / totalMacroKcal) * available
  const carbsLen = (carbsKcal / totalMacroKcal) * available
  const fatLen = (fatKcal / totalMacroKcal) * available

  const start = innerCirc * 0.25

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-44 h-44 drop-shadow-lg">
      {/* Track rings */}
      <circle
        cx={CX} cy={CY} r={OUTER_R}
        fill="none" stroke="#1e293b" strokeWidth={OUTER_STROKE}
      />
      <circle
        cx={CX} cy={CY} r={INNER_R}
        fill="none" stroke="#1e293b" strokeWidth={INNER_STROKE}
      />

      {/* Calorie progress ring */}
      {calPct > 0 && (
        <circle
          cx={CX} cy={CY} r={OUTER_R}
          fill="none" stroke="#10b981" strokeWidth={OUTER_STROKE}
          strokeDasharray={`${calDash} ${outerCirc - calDash}`}
          strokeDashoffset={outerCirc * 0.25}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      )}

      {/* Protein arc (blue) */}
      {proteinLen > 1 && (
        <circle
          cx={CX} cy={CY} r={INNER_R}
          fill="none" stroke="#3b82f6" strokeWidth={INNER_STROKE}
          strokeDasharray={`${proteinLen} ${innerCirc - proteinLen}`}
          strokeDashoffset={start}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      )}

      {/* Carbs arc (orange) */}
      {carbsLen > 1 && (
        <circle
          cx={CX} cy={CY} r={INNER_R}
          fill="none" stroke="#f97316" strokeWidth={INNER_STROKE}
          strokeDasharray={`${carbsLen} ${innerCirc - carbsLen}`}
          strokeDashoffset={start - proteinLen - GAP}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      )}

      {/* Fat arc (yellow) */}
      {fatLen > 1 && (
        <circle
          cx={CX} cy={CY} r={INNER_R}
          fill="none" stroke="#eab308" strokeWidth={INNER_STROKE}
          strokeDasharray={`${fatLen} ${innerCirc - fatLen}`}
          strokeDashoffset={start - proteinLen - GAP - carbsLen - GAP}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      )}

      {/* Center: calories */}
      <text
        x={CX} y={CY - 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="28" fontWeight="700" fill="white"
      >
        {Math.round(calories)}
      </text>
      <text
        x={CX} y={CY + 16}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fill="#64748b"
      >
        {targetCalories > 0 ? `/ ${targetCalories} kcal` : 'kcal'}
      </text>

      {/* Remaining calories label */}
      {targetCalories > 0 && (
        <text
          x={CX} y={CY + 31}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fill="#94a3b8"
        >
          {Math.max(0, targetCalories - Math.round(calories))} restantes
        </text>
      )}
    </svg>
  )
}
