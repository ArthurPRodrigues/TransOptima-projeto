import { ReactNode, useEffect } from "react";

type Props = { open: boolean; onClose: () => void; title?: string; children: ReactNode };

export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
