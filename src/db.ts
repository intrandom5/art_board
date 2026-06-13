import Dexie, { type Table } from "dexie";
import type { BoardItem, Background } from "./types";

export interface BoardRecord {
  id: string;
  name: string;
  items: BoardItem[];
  background: Background;
  /** small dataURL preview for the gallery */
  thumbnail?: string;
  updatedAt: number;
}

class ArtBoardDB extends Dexie {
  boards!: Table<BoardRecord, string>;

  constructor() {
    super("artboard");
    this.version(1).stores({
      boards: "id, updatedAt",
    });
  }
}

export const db = new ArtBoardDB();

export async function saveBoard(rec: BoardRecord) {
  await db.boards.put(rec);
}

export async function deleteBoard(id: string) {
  await db.boards.delete(id);
}

export async function listBoards(): Promise<BoardRecord[]> {
  return db.boards.orderBy("updatedAt").reverse().toArray();
}
