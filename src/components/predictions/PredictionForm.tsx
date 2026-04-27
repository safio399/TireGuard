import { Loader2, Play, RotateCcw, TestTubeDiagonal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PredictionInputType, PredictionRequest } from '@/types/prediction'

const INPUT_FIELDS: Array<{
  key: keyof PredictionRequest
  label: string
  type?: 'number'
  step?: string
  min?: string
}> = [
  { key: 'air_temperature', label: 'Air Temperature (K)', type: 'number', step: '0.1', min: '0' },
  { key: 'process_temperature', label: 'Process Temperature (K)', type: 'number', step: '0.1', min: '0' },
  { key: 'rotational_speed', label: 'Rotational Speed (rpm)', type: 'number', step: '1', min: '0' },
  { key: 'torque', label: 'Torque (Nm)', type: 'number', step: '0.1', min: '0' },
  { key: 'tool_wear', label: 'Tool Wear (min)', type: 'number', step: '1', min: '0' },
]

interface PredictionFormValues {
  air_temperature: string
  process_temperature: string
  rotational_speed: string
  torque: string
  tool_wear: string
  type: PredictionInputType | ''
}

interface PredictionFormProps {
  values: PredictionFormValues
  isLoading: boolean
  error: string | null
  onChange: <K extends keyof PredictionFormValues>(key: K, value: PredictionFormValues[K]) => void
  onSubmit: () => void
  onLoadSample: () => void
  onReset: () => void
}

export default function PredictionForm({
  values,
  isLoading,
  error,
  onChange,
  onSubmit,
  onLoadSample,
  onReset,
}: PredictionFormProps) {
  return (
    <Card className="glass-card border-border/40 bg-card/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex h-full flex-col gap-5 p-5 md:p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-display font-semibold tracking-[0.18em]" style={{ color: 'var(--tg-text-primary)' }}>
            MACHINE INPUTS
          </h2>
          <p className="text-sm font-body" style={{ color: 'var(--tg-text-secondary)' }}>
            Enter live operating conditions to evaluate tire failure probability.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {INPUT_FIELDS.map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="text-[11px] font-display tracking-[0.16em]" style={{ color: 'var(--tg-text-muted)' }}>
                {field.label}
              </span>
              <Input
                type={field.type}
                inputMode="decimal"
                step={field.step}
                min={field.min}
                value={values[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                className={cn(
                  'h-11 rounded-lg border-border/60 bg-background/60 font-mono-data text-sm shadow-none',
                  'focus-visible:ring-1 focus-visible:ring-[var(--tg-accent)] focus-visible:ring-offset-0'
                )}
                placeholder="0.0"
              />
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-[11px] font-display tracking-[0.16em]" style={{ color: 'var(--tg-text-muted)' }}>
              TYPE
            </span>
            <select
              value={values.type}
              onChange={(event) => onChange('type', event.target.value as PredictionInputType | '')}
              className={cn(
                'flex h-11 w-full rounded-lg border border-border/60 bg-background/60 px-3 text-sm font-mono-data',
                'text-[var(--tg-text-primary)] outline-none transition focus:border-[var(--tg-accent)]'
              )}
            >
              <option value="">Select type</option>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="H">H</option>
            </select>
          </label>
        </div>

        {error && (
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: 'rgba(var(--tg-critical-rgb), 0.35)',
              background: 'rgba(var(--tg-critical-rgb), 0.08)',
              color: 'var(--tg-critical)',
            }}
          >
            {error}
          </div>
        )}

        <div className="mt-auto grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className={cn(
              'h-11 rounded-lg border-0 font-mono-data text-[13px] uppercase tracking-[0.18em] text-slate-950',
              'shadow-[0_0_24px_rgba(var(--tg-accent-rgb),0.18)]'
            )}
            style={{
              background: 'linear-gradient(135deg, #00F5FF 0%, #2563EB 100%)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Prediction
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onLoadSample}
            disabled={isLoading}
            className="h-11 rounded-lg border-border/60 bg-background/50 font-mono-data text-[13px] uppercase tracking-[0.14em]"
          >
            <TestTubeDiagonal className="mr-2 h-4 w-4" />
            Load Sample
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={isLoading}
            className="h-11 rounded-lg border border-border/50 bg-transparent font-mono-data text-[13px] uppercase tracking-[0.14em]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}

export type { PredictionFormValues }
