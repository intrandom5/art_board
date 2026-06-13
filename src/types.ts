export interface BaseItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

export interface ImageItem extends BaseItem {
  type: "image";
  /** data URL (base64) so it survives reloads */
  src: string;
  width: number;
  height: number;
  /** decorative photo frame */
  frame: "none" | "polaroid";
}

export interface TapeItem extends BaseItem {
  type: "tape";
  width: number;
  height: number;
  color: string;
}

export interface TextItem extends BaseItem {
  type: "text";
  text: string;
  fontSize: number;
  fill: string;
}

export type BoardItem = ImageItem | TextItem | TapeItem;

export type Pattern = "plain" | "dot" | "grid";

export interface Background {
  color: string;
  pattern: Pattern;
}
