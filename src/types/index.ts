export interface GeneratorData {
  deviceId: string;
  temperature: number;
  vibration: number;
  current: number;
  fuelLevel: number;
  timestamp: string;
}

export interface PredictionData {
  device_id: string;
  predicted_power: number;
  moving_avg: number;
  min_expected: number;
  max_expected: number;
  anomaly: boolean;
  confidence: number;
}

export type StatusType = 'NORMAL' | 'WARNING' | 'CRITICAL';
