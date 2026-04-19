export interface GeneratorData {
  deviceId: string;
  temperature: number;
  vibration: number;
  current: number;
  fuelLevel: number;
  timestamp: string;
}

export type StatusType = 'NORMAL' | 'WARNING' | 'CRITICAL';
