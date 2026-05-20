import { create } from 'zustand'
import { todayISO } from '@/lib/utils'

interface UIState {
  selectedDate: string
  sidebarOpen: boolean
  setSelectedDate: (date: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedDate: todayISO(),
  sidebarOpen: false,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
