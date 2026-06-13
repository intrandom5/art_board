import { useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import Toolbar from "./components/Toolbar";
import Board from "./components/Board";
import Gallery from "./components/Gallery";
import { useBoard } from "./store";
import { db, saveBoard, listBoards, type BoardRecord } from "./db";
import { uid, fileToImageItem } from "./utils";

const LAST_KEY = "artboard:lastBoardId";

export default function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const [ready, setReady] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const items = useBoard((s) => s.items);
  const background = useBoard((s) => s.background);
  const name = useBoard((s) => s.name);
  const boardId = useBoard((s) => s.boardId);
  const selectedId = useBoard((s) => s.selectedId);
  const removeItem = useBoard((s) => s.removeItem);
  const addItem = useBoard((s) => s.addItem);
  const loadBoard = useBoard((s) => s.loadBoard);

  /** Snapshot the current store into a BoardRecord (with a fresh thumbnail). */
  const snapshot = useCallback((): BoardRecord => {
    const s = useBoard.getState();
    let thumbnail: string | undefined;
    try {
      thumbnail = stageRef.current?.toDataURL({ pixelRatio: 0.25 });
    } catch {
      thumbnail = undefined;
    }
    return {
      id: s.boardId,
      name: s.name,
      items: s.items,
      background: s.background,
      thumbnail,
      updatedAt: Date.now(),
    };
  }, []);

  const saveNow = useCallback(async () => {
    const rec = snapshot();
    await saveBoard(rec);
    localStorage.setItem(LAST_KEY, rec.id);
  }, [snapshot]);

  // initial load: open last board, migrate old data, or start a fresh one
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return; // guard against StrictMode double-run
    didInit.current = true;
    (async () => {
      const boards = await listBoards();
      const lastId = localStorage.getItem(LAST_KEY);
      let rec: BoardRecord | undefined;

      if (boards.length) {
        rec = boards.find((b) => b.id === lastId) ?? boards[0];
      } else {
        const oldItems = localStorage.getItem("artboard:items");
        if (oldItems) {
          const oldBg = localStorage.getItem("artboard:bg");
          rec = {
            id: uid(),
            name: "내 보드",
            items: JSON.parse(oldItems),
            background: oldBg ? JSON.parse(oldBg) : { color: "#fbfaf6", pattern: "dot" },
            updatedAt: Date.now(),
          };
        } else {
          rec = {
            id: uid(),
            name: "내 보드",
            items: [],
            background: { color: "#fbfaf6", pattern: "dot" },
            updatedAt: Date.now(),
          };
        }
        await saveBoard(rec);
      }

      loadBoard(rec);
      localStorage.setItem(LAST_KEY, rec.id);
      setReady(true);
    })();
  }, [loadBoard]);

  // debounced autosave on any content change
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => void saveNow(), 700);
    return () => clearTimeout(t);
  }, [ready, items, background, name, boardId, saveNow]);

  // delete-selected via keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        removeItem(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeItem]);

  // paste images from clipboard (Ctrl/Cmd+V)
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.items ?? [])
        .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
        .map((it) => it.getAsFile())
        .filter((f): f is File => f !== null);
      if (!files.length) return;
      e.preventDefault();
      const cx = window.innerWidth / 2;
      const cy = (window.innerHeight - 52) / 2;
      let offset = 0;
      for (const file of files) {
        addItem(await fileToImageItem(file, cx + offset, cy + offset));
        offset += 24;
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addItem]);

  const openGallery = async () => {
    await saveNow(); // flush current board so its thumbnail is up to date
    setGalleryOpen(true);
  };

  const handleOpen = (rec: BoardRecord) => {
    loadBoard(rec);
    localStorage.setItem(LAST_KEY, rec.id);
    setGalleryOpen(false);
  };

  const handleNew = async () => {
    await saveNow();
    const rec: BoardRecord = {
      id: uid(),
      name: "새 보드",
      items: [],
      background: { color: "#fbfaf6", pattern: "dot" },
      updatedAt: Date.now(),
    };
    await saveBoard(rec);
    loadBoard(rec);
    localStorage.setItem(LAST_KEY, rec.id);
    setGalleryOpen(false);
  };

  const handleDeletedCurrent = async () => {
    const boards = await listBoards();
    if (boards.length) handleOpen(boards[0]);
    else await handleNew();
  };

  if (!ready) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.4)" }}>
        불러오는 중…
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar stageRef={stageRef} onOpenGallery={openGallery} />
      <div style={{ flex: 1, position: "relative" }}>
        <Board ref={stageRef} />
        {items.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              color: "rgba(0,0,0,0.35)",
              fontSize: 18,
            }}
          >
            이미지를 끌어다 놓거나 "＋ 이미지"로 시작하세요
          </div>
        )}
      </div>
      {galleryOpen && (
        <Gallery
          db={db}
          currentBoardId={boardId}
          onOpen={handleOpen}
          onNew={handleNew}
          onDeletedCurrent={handleDeletedCurrent}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
