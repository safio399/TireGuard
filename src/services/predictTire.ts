import type { PredictionRequest, PredictionResponse } from '../types/prediction'

const PREDICT_ENDPOINT = 'http://127.0.0.1:8000/predict'

export async function predictTire(payload: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(PREDICT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Prediction request failed with status ${response.status}`)
  }

  return response.json() as Promise<PredictionResponse>
}
