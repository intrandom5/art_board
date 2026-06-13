import { create } from "zustand";
import type { BoardItem, Background } from "./types";
import type { BoardRecord } from "./db";
import { uid } from "./utils";

const DEFAULT_BG: Background = { color: "#fbfaf6", pattern: "dot" };

export function blankBoard(name = "새 보드"): {
  boardId: string;
  name: string;
  items: BoardItem[];
  background: Background;
} {
  return { boardId: uid(), name, items: [], background: { ...DEFAULT_BG } };
}

interface BoardState {
  boardId: string;
  name: string;
  items: BoardItem[];
  background: Background;
  selectedId: string | null;

  addItem: (item: BoardItem) => void;
  updateItem: (id: string, patch: Partial<BoardItem>) => void;
  removeItem: (id: string) => void;
  select: (id: string | null) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setBackground: (patch: Partial<Background>) => void;
  setName: (name: string) => void;
  clearAll: () => void;

  loadBoard: (rec: BoardRecord) => void;
  newBoard: (name?: string) => void;
}

export const useBoard = create<BoardState>((set) => ({
  ...blankBoard(),
  selectedId: null,

  addItem: (item) =>
    set((s) => ({ items: [...s.items, item], selectedId: item.id })),

  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? ({ ...i, ...patch } as BoardItem) : i)),
    })),

  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  select: (id) => set({ selectedId: id }),

  bringForward: (id) =>
    set((s) => {
      const idx = s.items.findIndex((i) => i.id === id);
      if (idx < 0 || idx === s.items.length - 1) return s;
      const items = [...s.items];
      [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
      return { items };
    }),

  sendBackward: (id) =>
    set((s) => {
      const idx = s.items.findIndex((i) => i.id === id);
      if (idx <= 0) return s;
      const items = [...s.items];
      [items[idx], items[idx - 1]] = [items[idx - 1], items[idx]];
      return { items };
    }),

  setBackground: (patch) =>
    set((s) => ({ background: { ...s.background, ...patch } })),

  setName: (name) => set({ name }),

  clearAll: () => set({ items: [], selectedId: null }),

  loadBoard: (rec) =>
    set({
      boardId: rec.id,
      name: rec.name,
      items: rec.items,
      background: rec.background,
      selectedId: null,
    }),

  newBoard: (name) =>
    set({ ...blankBoard(name), selectedId: null }),
}));
