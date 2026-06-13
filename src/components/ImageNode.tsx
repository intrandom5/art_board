import { useRef, useEffect } from "react";
import { Group, Image as KonvaImage, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import type { ImageItem } from "../types";

interface Props {
  image: ImageItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<ImageItem>) => void;
}

const PAD = 12;
const CAPTION = 38;

export default function ImageNode({ image, isSelected, onSelect, onChange }: Props) {
  const [img] = useImage(image.src);
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const polaroid = image.frame === "polaroid";

  return (
    <>
      <Group
        ref={groupRef}
        x={image.x}
        y={image.y}
        rotation={image.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;
          const scale = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, image.width * scale),
            height: Math.max(20, image.height * scale),
            rotation: node.rotation(),
          });
        }}
      >
        {polaroid && (
          <Rect
            x={-PAD}
            y={-PAD}
            width={image.width + PAD * 2}
            height={image.height + PAD * 2 + CAPTION}
            fill="#ffffff"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
            shadowColor="black"
            shadowOpacity={0.18}
            shadowBlur={8}
            shadowOffsetY={3}
          />
        )}
        <KonvaImage image={img} width={image.width} height={image.height} />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}
