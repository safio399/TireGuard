// ═══ Legacy Machine Types (backward compat) ═══
export type FailureType = 'TWF' | 'HDF' | 'PWF' | 'OSF' | 'RNF' | null
export type ProductType = 'L' | 'M' | 'H'
export type RiskLevel = 'critical' | 'warning' | 'healthy'

export interface Machine {
  id: string
  udi: number
  type: ProductType
  airTemp: number
  processTemp: number
  rpm: number
  torque: number
  toolWear: number
  actualFailure: 0 | 1
  predictedProb: number
  predictedFailure: 0 | 1
  failureType: FailureType
}

export interface ModelMetrics {
  recall: number
  precision: number
  f1: number
  rocAuc: number
  threshold: number
  tp: number
  tn: number
  fp: number
  fn: number
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface AppData {
  machines: Machine[]
  modelMetrics: ModelMetrics
  featureImportance: FeatureImportance[]
}

export interface ThresholdMetrics {
  tp: number
  tn: number
  fp: number
  fn: number
  precision: number
  recall: number
  f1: number
}

// ═══ Tire-specific Types ═══

export type TirePosition = 'FL' | 'FR' | 'RL' | 'RR'
export type TireRiskLevel = 'safe' | 'warn' | 'elevated' | 'critical'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface TireSensor {
  pressure: number       // PSI (28-36 normal)
  temperature: number    // °F (60-90 normal)
  treadDepth: number     // mm (2-10, <3 = dangerous)
  age: number            // months
  alignment: number      // 0-100 score
  timestamp: string      // ISO timestamp
  latency: number        // ms (simulated sensor latency)
}

export interface Tire {
  id: string
  position: TirePosition
  label: string           // "Front Left"
  level: TireRiskLevel
  sensor: TireSensor
  brand: string           // fictional: "TG-400", "TG-600R"
  lastService: string     // ISO date
  predictedReplacement: string  // ISO date
  confidence: number      // 0-1
  faultZones: FaultZone[]
}

export interface FaultZone {
  type: 'crack' | 'bulge' | 'puncture' | 'wear'
  severity: number       // 0-1
  position: { x: number; y: number; z: number }
  description: string
}

export interface FleetVehicle {
  id: string
  name: string           // "Fleet Unit 017"
  plate: string          // "TG-0417"
  tires: Tire[]
  status: 'active' | 'maintenance' | 'standby'
  mileage: number
  lastSync: string       // ISO timestamp
  syncStatus: 'live' | 'syncing' | 'offline'
}

export interface TireAlert {
  id: string
  vehicleId: string
  tireId: string
  severity: AlertSeverity
  title: string
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: string
  acknowledged: boolean
}

export interface PredictionPoint {
  date: string
  value: number
  lower: number          // confidence interval lower bound
  upper: number          // confidence interval upper bound
}

export interface PredictionTimeline {
  tireId: string
  metric: 'treadDepth' | 'pressure' | 'temperature'
  current: number
  predictions: PredictionPoint[]
  replacementDate: string
  confidence: number
}

export interface TireAppData {
  fleet: FleetVehicle[]
  alerts: TireAlert[]
  predictions: PredictionTimeline[]
}
