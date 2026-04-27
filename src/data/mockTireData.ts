import type {
  FleetVehicle, Tire, TirePosition, TireRiskLevel,
  TireSensor, FaultZone, TireAlert, PredictionTimeline, PredictionPoint, TireAppData
} from '../types'

// ═══ Helpers ═══
const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const isoDate = (daysFromNow: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}
const isoNow = () => new Date().toISOString()

const positions: { pos: TirePosition; label: string }[] = [
  { pos: 'FL', label: 'Front Left' },
  { pos: 'FR', label: 'Front Right' },
  { pos: 'RL', label: 'Rear Left' },
  { pos: 'RR', label: 'Rear Right' },
]

const brands = ['TG-400', 'TG-600R', 'TG-800X', 'TG-200S']

function getRiskLevel(sensor: TireSensor): TireRiskLevel {
  if (sensor.pressure < 24 || sensor.treadDepth < 2.5 || sensor.temperature > 88) return 'critical'
  if (sensor.pressure < 27 || sensor.treadDepth < 4 || sensor.temperature > 82) return 'elevated'
  if (sensor.pressure < 30 || sensor.treadDepth < 5 || sensor.temperature > 76) return 'warn'
  return 'safe'
}

function generateFaults(level: TireRiskLevel): FaultZone[] {
  if (level === 'safe') return []
  const faults: FaultZone[] = []
  if (level === 'warn') {
    faults.push({
      type: 'wear', severity: 0.3,
      position: { x: 0.5, y: 0.1, z: 0 },
      description: 'Mild tread wear detected on outer edge',
    })
  }
  if (level === 'elevated') {
    faults.push(
      { type: 'wear', severity: 0.6, position: { x: 0.5, y: 0.1, z: 0 }, description: 'Significant tread wear on outer edge' },
      { type: 'crack', severity: 0.4, position: { x: -0.3, y: 0.4, z: 0.2 }, description: 'Hairline crack on sidewall' },
    )
  }
  if (level === 'critical') {
    faults.push(
      { type: 'wear', severity: 0.9, position: { x: 0.5, y: 0.1, z: 0 }, description: 'Critical tread depth below safety limit' },
      { type: 'crack', severity: 0.7, position: { x: -0.3, y: 0.4, z: 0.2 }, description: 'Deep crack on sidewall' },
      { type: 'bulge', severity: 0.8, position: { x: 0, y: -0.5, z: 0.3 }, description: 'Sidewall bulge — risk of blowout' },
    )
  }
  return faults
}

function generateTire(pos: TirePosition, label: string, vehicleIdx: number): Tire {
  // Create varied but realistic sensor data
  const isProblematic = Math.random() > 0.65
  const sensor: TireSensor = {
    pressure: isProblematic ? rand(20, 29) : rand(30, 35),
    temperature: isProblematic ? rand(75, 92) : rand(60, 74),
    treadDepth: isProblematic ? rand(1.5, 5) : rand(5.5, 9.5),
    age: randInt(4, 36),
    alignment: isProblematic ? randInt(45, 75) : randInt(78, 98),
    timestamp: isoNow(),
    latency: randInt(12, 180),
  }
  const level = getRiskLevel(sensor)
  return {
    id: `V${String(vehicleIdx).padStart(3, '0')}-${pos}`,
    position: pos,
    label,
    level,
    sensor,
    brand: brands[vehicleIdx % brands.length],
    lastService: isoDate(-randInt(7, 90)),
    predictedReplacement: isoDate(randInt(14, 180)),
    confidence: rand(0.72, 0.96),
    faultZones: generateFaults(level),
  }
}

function generateVehicle(idx: number): FleetVehicle {
  const tires = positions.map(p => generateTire(p.pos, p.label, idx))
  const worstTire = tires.reduce((worst, t) => {
    const order: Record<TireRiskLevel, number> = { safe: 0, warn: 1, elevated: 2, critical: 3 }
    return order[t.level] > order[worst.level] ? t : worst
  })
  const status = worstTire.level === 'critical' ? 'maintenance' as const :
                 worstTire.level === 'elevated' ? 'maintenance' as const : 'active' as const
  return {
    id: `V${String(idx).padStart(3, '0')}`,
    name: `Fleet Unit ${String(idx).padStart(3, '0')}`,
    plate: `TG-${String(1000 + idx)}`,
    tires,
    status: idx === 5 ? 'standby' : status,
    mileage: randInt(12000, 185000),
    lastSync: isoNow(),
    syncStatus: Math.random() > 0.1 ? 'live' : 'syncing',
  }
}

function generateAlerts(fleet: FleetVehicle[]): TireAlert[] {
  const alerts: TireAlert[] = []
  let alertId = 1
  for (const v of fleet) {
    for (const t of v.tires) {
      if (t.level === 'critical') {
        alerts.push({
          id: `ALT-${String(alertId++).padStart(4, '0')}`,
          vehicleId: v.id,
          tireId: t.id,
          severity: 'critical',
          title: 'Critical Tire Condition',
          message: `${t.label} on ${v.name} requires immediate service. ${t.faultZones[0]?.description || 'Multiple faults detected.'}`,
          metric: t.sensor.treadDepth < 3 ? 'treadDepth' : t.sensor.pressure < 24 ? 'pressure' : 'temperature',
          value: t.sensor.treadDepth < 3 ? t.sensor.treadDepth : t.sensor.pressure < 24 ? t.sensor.pressure : t.sensor.temperature,
          threshold: t.sensor.treadDepth < 3 ? 3 : t.sensor.pressure < 24 ? 24 : 85,
          timestamp: isoDate(-rand(0, 0.5)),
          acknowledged: false,
        })
      } else if (t.level === 'elevated') {
        alerts.push({
          id: `ALT-${String(alertId++).padStart(4, '0')}`,
          vehicleId: v.id,
          tireId: t.id,
          severity: 'warning',
          title: 'Tire Condition Warning',
          message: `${t.label} on ${v.name} showing signs of wear. Schedule inspection.`,
          metric: 'treadDepth',
          value: t.sensor.treadDepth,
          threshold: 4,
          timestamp: isoDate(-rand(0, 2)),
          acknowledged: Math.random() > 0.5,
        })
      }
    }
  }
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generatePredictions(fleet: FleetVehicle[]): PredictionTimeline[] {
  const timelines: PredictionTimeline[] = []
  for (const v of fleet) {
    for (const t of v.tires) {
      const points: PredictionPoint[] = []
      let val = t.sensor.treadDepth
      for (let d = 0; d <= 180; d += 7) {
        const decay = rand(0.05, 0.15)
        val = Math.max(0, val - decay)
        const spread = rand(0.3, 0.8)
        points.push({
          date: isoDate(d),
          value: Math.round(val * 100) / 100,
          lower: Math.round(Math.max(0, val - spread) * 100) / 100,
          upper: Math.round((val + spread) * 100) / 100,
        })
      }
      timelines.push({
        tireId: t.id,
        metric: 'treadDepth',
        current: t.sensor.treadDepth,
        predictions: points,
        replacementDate: t.predictedReplacement,
        confidence: t.confidence,
      })
    }
  }
  return timelines
}

// ═══ Generate full dataset ═══
export function generateTireAppData(): TireAppData {
  const fleet = Array.from({ length: 12 }, (_, i) => generateVehicle(i + 1))
  return {
    fleet,
    alerts: generateAlerts(fleet),
    predictions: generatePredictions(fleet),
  }
}

// ═══ Summary stats ═══
export function getFleetSummary(data: TireAppData) {
  const allTires = data.fleet.flatMap(v => v.tires)
  return {
    totalVehicles: data.fleet.length,
    totalTires: allTires.length,
    safe: allTires.filter(t => t.level === 'safe').length,
    warn: allTires.filter(t => t.level === 'warn').length,
    elevated: allTires.filter(t => t.level === 'elevated').length,
    critical: allTires.filter(t => t.level === 'critical').length,
    avgPressure: Math.round(allTires.reduce((s, t) => s + t.sensor.pressure, 0) / allTires.length * 10) / 10,
    avgTreadDepth: Math.round(allTires.reduce((s, t) => s + t.sensor.treadDepth, 0) / allTires.length * 10) / 10,
    avgTemperature: Math.round(allTires.reduce((s, t) => s + t.sensor.temperature, 0) / allTires.length * 10) / 10,
    activeAlerts: data.alerts.filter(a => !a.acknowledged).length,
    vehiclesInMaintenance: data.fleet.filter(v => v.status === 'maintenance').length,
  }
}
