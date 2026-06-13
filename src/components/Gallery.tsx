import { useLiveQuery } from "dexie-react-hooks";
import type { BoardRecord } from "../db";
import { db as dbType, deleteBoard } from "../db";
import { useBoard } from "../store";

interface Props {
  db: typeof dbType;
  currentBoardId: string;
  onOpen: (rec: BoardRecord) => void;
  onNew: () => void;
  onDeletedCurrent: () => void;
  onClose: () => void;
}

export default function Gallery({ db, currentBoardId, onOpen, onNew, onDeletedCurrent, onClose }: Props) {
  const boards = useLiveQuery(() => db.boards.orderBy("updatedAt").reverse().toArray(), []) ?? [];

  const rename = async (rec: BoardRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = window.prompt("보드 이름", rec.name);
    if (next && next.trim()) {
      await db.boards.update(rec.id, { name: next.trim() });
      if (rec.id === currentBoardId) useBoard.getState().setName(next.trim());
    }
  };

  const remove = async (rec: BoardRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`"${rec.name}" 보드를 삭제할까요?`)) return;
    await deleteBoard(rec.id);
    if (rec.id === currentBoardId) onDeletedCurrent();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(860px, 92vw)",
          maxHeight: "82vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>내 보드</h2>
          <button
            onClick={onNew}
            style={{
              marginLeft: "auto",
              height: 34,
              padding: "0 14px",
              borderRadius: 8,
              border: "none",
              background: "#2c2c2a",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ＋ 새 보드
          </button>
          <button
            onClick={onClose}
            style={{
              marginLeft: 8,
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.25)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {boards.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onOpen(rec)}
              style={{
                cursor: "pointer",
                border:
                  rec.id === currentBoardId
                    ? "2px solid #2c2c2a"
                    : "0.5px solid rgba(0,0,0,0.18)",
                borderRadius: 10,
                overflow: "hidden",
                background: "#faf9f5",
              }}
            >
              <div style={{ height: 120, background: rec.background.color, overflow: "hidden" }}>
                {rec.thumbnail ? (
                  <img
                    src={rec.thumbnail}
                    alt={rec.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.3)" }}>
                    빈 보드
                  </div>
                )}
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontWeight: 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rec.name}
                  {rec.id === currentBoardId && (
                    <span style={{ color: "rgba(0,0,0,0.4)", fontWeight: 400 }}> · 현재</span>
                  )}
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                  <button onClick={(e) => rename(rec, e)} style={miniBtn}>이름변경</button>
                  <button onClick={(e) => remove(rec, e)} style={miniBtn}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 6,
  border: "0.5px solid rgba(0,0,0,0.2)",
  background: "#fff",
  cursor: "pointer",
};
