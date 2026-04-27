import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Machine, RiskLevel, ThresholdMetrics } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskLevel(prob: number): RiskLevel {
  if (prob >= 0.5) return 'critical'
  if (prob >= 0.25) return 'warning'
  return 'healthy'
}

export function getRiskColor(level: RiskLevel) {
  return {
    critical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    warning:  'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    healthy:  'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  }[level]
}

export function getDotColor(level: RiskLevel) {
  return {
    critical: 'bg-red-500',
    warning:  'bg-amber-500',
    healthy:  'bg-green-500',
  }[level]
}

export function getFailureTypeColor(type: string | null) {
  if (!type) return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  return {
    TWF: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    HDF: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    PWF: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    OSF: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    RNF: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  }[type] ?? 'bg-gray-100 text-gray-500'
}

export function getRecommendedAction(type: string | null): string {
  return {
    TWF: 'Schedule tool replacement within 4 hours',
    HDF: 'Check cooling system and lubrication immediately',
    PWF: 'Inspect power supply and motor load',
    OSF: 'Reduce operational load immediately',
    RNF: 'Run full diagnostic inspection',
  }[type ?? ''] ?? 'No immediate action required — continue monitoring'
}

export function computeMetrics(machines: Machine[], threshold: number): ThresholdMetrics {
  let tp = 0, tn = 0, fp = 0, fn = 0
  for (const m of machines) {
    const predicted = m.predictedProb >= threshold ? 1 : 0
    if (predicted === 1 && m.actualFailure === 1) tp++
    else if (predicted === 0 && m.actualFailure === 0) tn++
    else if (predicted === 1 && m.actualFailure === 0) fp++
    else fn++
  }
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall    = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1        = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
  return { tp, tn, fp, fn, precision, recall, f1 }
}
