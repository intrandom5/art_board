import type { ImageItem, TextItem, TapeItem, Pattern } from "./types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

/** Turn a dropped/selected File into an ImageItem placed near a point, scaled to fit. */
export async function fileToImageItem(
  file: File,
  dropX: number,
  dropY: number
): Promise<ImageItem> {
  const src = await readAsDataURL(file);
  const { w, h } = await loadSize(src);
  const max = 280;
  const scale = Math.min(1, max / Math.max(w, h));
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  return {
    type: "image",
    id: uid(),
    src,
    x: dropX - width / 2,
    y: dropY - height / 2,
    width,
    height,
    frame: "none",
    rotation: (Math.random() - 0.5) * 10, // slight tilt → "placed by hand" feel
  };
}

const TAPE_COLORS = ["#f4d35e", "#e8a0bf", "#a0d2eb", "#b5e6b5", "#f6bd60"];

export function makeTapeItem(x: number, y: number, index: number): TapeItem {
  return {
    type: "tape",
    id: uid(),
    x: x - 60,
    y: y - 17,
    width: 120,
    height: 34,
    color: TAPE_COLORS[index % TAPE_COLORS.length],
    rotation: (Math.random() - 0.5) * 30,
  };
}

export function makeStickerItem(emoji: string, x: number, y: number): TextItem {
  return {
    type: "text",
    id: uid(),
    text: emoji,
    x,
    y,
    fontSize: 64,
    fill: "#2c2c2a",
    rotation: (Math.random() - 0.5) * 16,
  };
}

export function makeTextItem(text: string, x: number, y: number): TextItem {
  return {
    type: "text",
    id: uid(),
    text,
    x,
    y,
    fontSize: 28,
    fill: "#2c2c2a",
    rotation: 0,
  };
}

/** Build a small tileable canvas for the board background pattern. */
export function makePatternTile(pattern: Pattern): HTMLCanvasElement | null {
  if (pattern === "plain") return null;
  const size = 22;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  if (pattern === "dot") {
    ctx.beginPath();
    ctx.arc(1.5, 1.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (pattern === "grid") {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(size, 0.5);
    ctx.moveTo(0.5, 0);
    ctx.lineTo(0.5, size);
    ctx.stroke();
  }
  return c;
}
