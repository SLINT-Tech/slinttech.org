import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
interface ToastProps {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}
export default function Toast({ message, type, onClose }: ToastProps) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    // Errors stay available until dismissed so a recovery instruction is never lost.
    if (type === "error") return;
    const timer = setTimeout(
      () => closeRef.current(),
      message.length > 100 ? 8000 : 6000,
    );
    return () => clearTimeout(timer);
  }, [message, type]);
  return createPortal(
    <div
      className={`app-toast app-toast-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {type === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <p>{message}</p>
      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={17} />
      </button>
    </div>,
    document.querySelector("dialog[open]") || document.body,
  );
}
