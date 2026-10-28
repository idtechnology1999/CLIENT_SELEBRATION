import type { StageKey } from '../types';

// Must match the backend (SERVER-SELEBRATION/src/utils/stages.ts).
export const STAGE_INFO: Record<StageKey, { number: number; label: string; price: number; icon: string }> = {
  fish:    { number: 1, label: 'Fish',    price: 5000,   icon: '🐟' },
  dolphin: { number: 2, label: 'Dolphin', price: 15000,  icon: '🐬' },
  shark:   { number: 3, label: 'Shark',   price: 50000,  icon: '🦈' },
  whale:   { number: 4, label: 'Whale',   price: 150000, icon: '🐋' },
};

export const STAGE_KEYS = Object.keys(STAGE_INFO) as StageKey[];

export function isStageKey(value: unknown): value is StageKey {
  return typeof value === 'string' && value in STAGE_INFO;
}

export function stageKeyFromNumber(n: number): StageKey | null {
  return STAGE_KEYS[n - 1] ?? null;
}

export const naira = (n: number) => `₦${n.toLocaleString()}`;

export function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}
