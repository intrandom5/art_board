import { useRef, useEffect } from "react";
import { Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { TextItem } from "../types";

interface Props {
  item: TextItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<TextItem>) => void;
}

export default function TextNode({ item, isSelected, onSelect, onChange }: Props) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const edit = () => {
    const next = window.prompt("텍스트를 입력하세요", item.text);
    if (next !== null && next.trim() !== "") onChange({ text: next });
  };

  return (
    <>
      <Text
        ref={shapeRef}
        text={item.text}
        x={item.x}
        y={item.y}
        fontSize={item.fontSize}
        fill={item.fill}
        rotation={item.rotation}
        fontStyle="500"
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={edit}
        onDblTap={edit}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scale = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(8, item.fontSize * scale),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 12 ? oldBox : newBox)}
        />
      )}
    </>
  );
}
