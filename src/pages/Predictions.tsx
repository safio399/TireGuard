import { useMemo, useState } from 'react'
import {  Radar, ShieldCheck } from 'lucide-react'
import PredictionForm, { type PredictionFormValues } from '../components/predictions/PredictionForm'
import PredictionResult from '../components/predictions/PredictionResult'
import TireScene from '../components/three/TireScene'
import { predictTire } from '../services/predictTire'
import type { PredictionRequest, PredictionResponse } from '../types/prediction'

const EMPTY_FORM: PredictionFormValues = {
  air_temperature: '',
  process_temperature: '',
  rotational_speed: '',
  torque: '',
  tool_wear: '',
  type: '',
}

const SAMPLE_FORM: PredictionFormValues = {
  air_temperature: '300',
  process_temperature: '310',
  rotational_speed: '1500',
  torque: '40',
  tool_wear: '10',
  type: 'L',
}

export default function Predictions() {
  const [formValues, setFormValues] = useState<PredictionFormValues>(EMPTY_FORM)
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const metrics = useMemo(
    () => [
      { label: 'Inference Target', value: predictionResult?.status ?? 'Awaiting input', icon: ShieldCheck },
      { label: 'Probability', value: predictionResult ? `${(predictionResult.failure_probability * 100).toFixed(1)}%` : '--.-%', icon: Radar },
      
    ],
    [predictionResult]
  )

  const handleChange = <K extends keyof PredictionFormValues>(key: K, value: PredictionFormValues[K]) => {
    setFormValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    const payload = parseFormValues(formValues)

    if (!payload) {
      setPredictionResult(null)
      setError('Please complete every field before running a prediction.')
      return
    }

    setIsLoading(true)
    try {
      const result = await predictTire(payload)
      setPredictionResult(result)
    } catch {
      setPredictionResult(null)
      setError('Prediction service unavailable. Confirm the backend is running on http://127.0.0.1:8000.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSample = () => {
    setError(null)
    setPredictionResult(null)
    setFormValues({ ...SAMPLE_FORM })
  }

  const handleReset = () => {
    setError(null)
    setPredictionResult(null)
    setFormValues({ ...EMPTY_FORM })
  }

  return (
    <div className="flex min-h-full flex-col lg:h-[calc(100vh-8.5rem)] lg:overflow-hidden">
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6 lg:overflow-hidden">
        <section className="order-2 flex min-h-0 flex-col gap-4 lg:order-1 lg:col-span-2 lg:overflow-hidden">
          <header className="space-y-2">
            <p className="text-[11px] font-mono-data uppercase tracking-[0.22em]" style={{ color: 'var(--tg-accent)' }}>
              AI Prediction
            </p>
            <h1 className="text-2xl font-display font-semibold tracking-[0.1em]" style={{ color: 'var(--tg-text-primary)' }}>
              AI Prediction Control Panel
            </h1>
            <p className="max-w-xl text-sm font-body" style={{ color: 'var(--tg-text-secondary)' }}>
              Simulate machine conditions and evaluate failure risk in real-time.
            </p>
          </header>

          <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_auto_1fr] lg:overflow-y-auto lg:pr-1">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-1">
              {metrics.map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card rounded-2xl border border-border/40 bg-card/30 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-display tracking-[0.16em]" style={{ color: 'var(--tg-text-muted)' }}>
                    <Icon className="h-4 w-4" style={{ color: 'var(--tg-accent)' }} />
                    {label}
                  </div>
                  <p className="mt-3 font-mono-data text-sm font-medium" style={{ color: 'var(--tg-text-primary)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <PredictionForm
              values={formValues}
              isLoading={isLoading}
              error={error}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onLoadSample={handleLoadSample}
              onReset={handleReset}
            />

            {predictionResult ? <PredictionResult result={predictionResult} /> : <div />}
          </div>
        </section>

        <section className="order-1 flex min-h-[50vh] flex-col lg:order-2 lg:col-span-3 lg:min-h-0">
          <div className="glass-card relative flex h-[50vh] min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-border/40 bg-card/20 lg:h-full">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
              <div>
                <p className="text-[11px] font-display tracking-[0.18em]" style={{ color: 'var(--tg-text-muted)' }}>
                  TIRE SCENE
                </p>
                <p className="mt-1 font-mono-data text-sm" style={{ color: 'var(--tg-text-primary)' }}>
                  {predictionResult?.status ?? 'Neutral Hologram'}
                </p>
              </div>
              <div
                className="rounded-full border px-3 py-1 text-[11px] font-mono-data uppercase tracking-[0.16em]"
                style={{
                  color: predictionResult?.status === 'Failure Risk' ? 'var(--tg-critical)' : 'var(--tg-accent)',
                  borderColor: predictionResult?.status === 'Failure Risk' ? 'rgba(var(--tg-critical-rgb),0.32)' : 'rgba(var(--tg-accent-rgb),0.22)',
                  background: predictionResult?.status === 'Failure Risk' ? 'rgba(var(--tg-critical-rgb),0.08)' : 'rgba(var(--tg-accent-rgb),0.08)',
                }}
              >
                {predictionResult ? `Label ${predictionResult.prediction}` : 'Idle'}
              </div>
            </div>

            <TireScene
              className="h-full w-full"
              showControls={false}
              predictionStatus={predictionResult?.status}
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function parseFormValues(values: PredictionFormValues): PredictionRequest | null {
  const airTemperature = Number(values.air_temperature)
  const processTemperature = Number(values.process_temperature)
  const rotationalSpeed = Number(values.rotational_speed)
  const torque = Number(values.torque)
  const toolWear = Number(values.tool_wear)

  if (
    !values.type ||
    [airTemperature, processTemperature, rotationalSpeed, torque, toolWear].some((value) => Number.isNaN(value)) ||
    [values.air_temperature, values.process_temperature, values.rotational_speed, values.torque, values.tool_wear].some((value) => value === '')
  ) {
    return null
  }

  return {
    air_temperature: airTemperature,
    process_temperature: processTemperature,
    rotational_speed: rotationalSpeed,
    torque,
    tool_wear: toolWear,
    type: values.type,
  }
}
