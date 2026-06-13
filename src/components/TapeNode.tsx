import { useRef, useEffect } from "react";
import { Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { TapeItem } from "../types";

interface Props {
  item: TapeItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<TapeItem>) => void;
}

export default function TapeNode({ item, isSelected, onSelect, onChange }: Props) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation}
        fill={item.color}
        opacity={0.62}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * sx),
            height: Math.max(10, node.height() * sy),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 10 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}
