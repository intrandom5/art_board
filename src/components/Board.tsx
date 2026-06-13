import { forwardRef, useEffect, useMemo, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { useBoard } from "../store";
import { fileToImageItem, makePatternTile } from "../utils";
import ImageNode from "./ImageNode";
import TextNode from "./TextNode";
import TapeNode from "./TapeNode";

const Board = forwardRef<Konva.Stage>((_props, ref) => {
  const { items, background, selectedId, addItem, updateItem, select } = useBoard();
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight - 52 });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight - 52 });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const tile = useMemo(() => makePatternTile(background.pattern), [background.pattern]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    const baseX = e.clientX;
    const baseY = e.clientY - 52;
    let offset = 0;
    for (const file of files) {
      addItem(await fileToImageItem(file, baseX + offset, baseY + offset));
      offset += 24;
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ width: "100%", height: "100%" }}
    >
      <Stage
        ref={ref}
        width={size.w}
        height={size.h}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) select(null);
        }}
      >
        <Layer listening={false}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={background.color} />
          {tile && (
            <Rect
              x={0}
              y={0}
              width={size.w}
              height={size.h}
              fillPatternImage={tile as unknown as HTMLImageElement}
              fillPatternRepeat="repeat"
            />
          )}
        </Layer>
        <Layer>
          {items.map((item) => {
            const common = {
              isSelected: item.id === selectedId,
              onSelect: () => select(item.id),
              onChange: (patch: Partial<typeof item>) => updateItem(item.id, patch),
            };
            if (item.type === "image")
              return <ImageNode key={item.id} {...common} image={item} />;
            if (item.type === "tape")
              return <TapeNode key={item.id} {...common} item={item} />;
            return <TextNode key={item.id} {...common} item={item} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
});

Board.displayName = "Board";
export default Board;
