import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { GeneratorData, StatusType } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatus(data: Partial<GeneratorData>): StatusType {
  const temp = data.temperature ?? 0;
  const vib = data.vibration ?? 0;
  if (temp > 90 || vib > 10) return 'CRITICAL';
  if (temp > 80 || vib > 5) return 'WARNING';
  return 'NORMAL';
}

export function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
