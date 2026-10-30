import { useSyncExternalStore } from 'react';
import { publicApi } from '../services/api';
import { STAGE_INFO, STAGE_KEYS } from '../utils/stages';
import type { StageKey } from '../types';

export type StagePrices = Record<StageKey, number>;

// Default prices, shown until the admin-panel prices have loaded.
const DEFAULT_PRICES = Object.fromEntries(STAGE_KEYS.map(k => [k, STAGE_INFO[k].price])) as StagePrices;

let prices: StagePrices = DEFAULT_PRICES;
let requested = false;
const listeners = new Set<() => void>();

function load() {
  if (requested) return;
  requested = true;
  publicApi.getSettings()
    .then(res => {
      const p = res.data.stagePrices;
      if (!p) return;
      prices = { ...DEFAULT_PRICES, ...p };
      listeners.forEach(l => l());
    })
    .catch(() => { requested = false; }); // try again next time a page needs prices
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => { listeners.delete(listener); };
}

// Monthly stage prices set in the admin panel (loaded once, shared by every page).
export function usePrices(): StagePrices {
  return useSyncExternalStore(subscribe, () => prices, () => prices);
}
