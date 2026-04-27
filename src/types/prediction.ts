export type PredictionInputType = 'L' | 'M' | 'H'

export interface PredictionRequest {
  air_temperature: number
  process_temperature: number
  rotational_speed: number
  torque: number
  tool_wear: number
  type: PredictionInputType
}

export type PredictionStatus = 'Healthy' | 'Failure Risk'

export interface PredictionResponse {
  failure_probability: number
  prediction: 0 | 1
  status: PredictionStatus
}
