import { create } from 'zustand';
import { TradeFilterParams } from '@/types/api.types';

interface TradeFilterState extends TradeFilterParams {
  setFilter: (key: keyof TradeFilterParams, value: any) => void;
  resetFilters: () => void;
}

const initialFilters: TradeFilterParams = {
  startDate: '',
  endDate: '',
  asset: '',
  setupName: '',
  direction: undefined,
  emotionalState: undefined,
  mistakeTagId: '',
  session: undefined,
  exitReason: undefined,
  page: 1,
  limit: 20,
  sortBy: 'entry_time',
  sortOrder: 'desc',
};

export const useTradeFilterStore = create<TradeFilterState>((set) => ({
  ...initialFilters,

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 on filter changes
    })),

  resetFilters: () => set(initialFilters),
}));
