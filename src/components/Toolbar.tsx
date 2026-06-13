import { useRef } from "react";
import type Konva from "konva";
import { useBoard } from "../store";
import { fileToImageItem, makeTextItem, makeTapeItem, makeStickerItem } from "../utils";
import type { Pattern } from "../types";

const STICKERS = ["★", "♥", "✿", "✦", "☻", "♪"];

interface Props {
  stageRef: React.RefObject<Konva.Stage>;
  onOpenGallery: () => void;
}

const btn: React.CSSProperties = {
  height: 32,
  padding: "0 12px",
  border: "0.5px solid rgba(0,0,0,0.25)",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const BG_COLORS = ["#fbfaf6", "#ffffff", "#f3ede4", "#e8f0ee", "#fdeef0", "#1f2430"];
const PATTERNS: { value: Pattern; label: string }[] = [
  { value: "plain", label: "민무늬" },
  { value: "dot", label: "도트" },
  { value: "grid", label: "모눈" },
];

export default function Toolbar({ stageRef, onOpenGallery }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    items,
    name,
    selectedId,
    background,
    addItem,
    updateItem,
    removeItem,
    bringForward,
    sendBackward,
    setBackground,
    setName,
    clearAll,
  } = useBoard();

  const selected = items.find((i) => i.id === selectedId);
  const center = () => ({ x: window.innerWidth / 2, y: (window.innerHeight - 52) / 2 });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    let offset = 0;
    const cx = window.innerWidth / 2;
    const cy = (window.innerHeight - 52) / 2;
    for (const file of files) {
      addItem(await fileToImageItem(file, cx + offset, cy + offset));
      offset += 24;
    }
    e.target.value = "";
  };

  const addText = () => {
    const text = window.prompt("텍스트를 입력하세요", "라벨");
    if (text && text.trim()) {
      const c = center();
      addItem(makeTextItem(text, c.x - 40, c.y));
    }
  };

  const addTape = () => {
    const c = center();
    const tapeCount = items.filter((i) => i.type === "tape").length;
    addItem(makeTapeItem(c.x, c.y, tapeCount));
  };

  const addSticker = (emoji: string) => {
    const c = center();
    addItem(makeStickerItem(emoji, c.x - 32, c.y - 32));
  };

  const togglePolaroid = () => {
    if (selected?.type === "image") {
      updateItem(selected.id, { frame: selected.frame === "polaroid" ? "none" : "polaroid" });
    }
  };

  const exportPng = () => {
    const stage = stageRef.current;
    if (!stage) return;
    useBoard.getState().select(null);
    requestAnimationFrame(() => {
      const url = stage.toDataURL({ pixelRatio: 2 });
      const a = document.createElement("a");
      a.download = `artboard-${Date.now()}.png`;
      a.href = url;
      a.click();
    });
  };

  return (
    <div
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        borderBottom: "0.5px solid rgba(0,0,0,0.15)",
        background: "#fff",
        overflowX: "auto",
      }}
    >
      <button style={{ ...btn, whiteSpace: "nowrap" }} onClick={onOpenGallery}>
        ☰ 내 보드
      </button>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        title="보드 이름"
        style={{
          height: 32,
          width: 130,
          padding: "0 8px",
          borderRadius: 8,
          border: "0.5px solid rgba(0,0,0,0.2)",
          fontWeight: 500,
        }}
      />

      <span style={{ width: 1, height: 22, background: "rgba(0,0,0,0.12)" }} />

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
      <button style={btn} onClick={() => fileRef.current?.click()}>
        ＋ 이미지
      </button>
      <button style={btn} onClick={addText}>
        T 텍스트
      </button>
      <button style={btn} onClick={addTape}>
        ▭ 테이프
      </button>
      <span style={{ display: "inline-flex", gap: 2 }}>
        {STICKERS.map((s) => (
          <button
            key={s}
            title="스티커 추가"
            onClick={() => addSticker(s)}
            style={{ ...btn, padding: "0 8px", fontSize: 16 }}
          >
            {s}
          </button>
        ))}
      </span>

      <span style={{ width: 1, height: 22, background: "rgba(0,0,0,0.12)" }} />

      <button
        style={{
          ...btn,
          whiteSpace: "nowrap",
          background: selected?.type === "image" && selected.frame === "polaroid" ? "#2c2c2a" : "#fff",
          color: selected?.type === "image" && selected.frame === "polaroid" ? "#fff" : "#2c2c2a",
        }}
        disabled={selected?.type !== "image"}
        onClick={togglePolaroid}
      >
        ▢ 폴라로이드
      </button>

      <span style={{ width: 1, height: 22, background: "rgba(0,0,0,0.12)" }} />

      <button style={btn} disabled={!selectedId} onClick={() => selectedId && bringForward(selectedId)}>
        앞으로
      </button>
      <button style={btn} disabled={!selectedId} onClick={() => selectedId && sendBackward(selectedId)}>
        뒤로
      </button>
      <button style={btn} disabled={!selectedId} onClick={() => selectedId && removeItem(selectedId)}>
        🗑 삭제
      </button>

      <span style={{ width: 1, height: 22, background: "rgba(0,0,0,0.12)" }} />

      <span style={{ display: "inline-flex", gap: 4 }}>
        {BG_COLORS.map((c) => (
          <button
            key={c}
            title="배경색"
            onClick={() => setBackground({ color: c })}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              cursor: "pointer",
              background: c,
              border:
                background.color === c
                  ? "2px solid #2c2c2a"
                  : "0.5px solid rgba(0,0,0,0.25)",
            }}
          />
        ))}
      </span>
      <select
        value={background.pattern}
        onChange={(e) => setBackground({ pattern: e.target.value as Pattern })}
        style={{ ...btn, paddingRight: 6 }}
      >
        {PATTERNS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <span style={{ marginLeft: "auto" }} />

      <button style={{ ...btn, whiteSpace: "nowrap" }} onClick={clearAll}>
        전체 지우기
      </button>
      <button
        style={{ ...btn, background: "#2c2c2a", color: "#fff", border: "none", whiteSpace: "nowrap" }}
        onClick={exportPng}
      >
        ⬇ PNG 저장
      </button>
    </div>
  );
}
