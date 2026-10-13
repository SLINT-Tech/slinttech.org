import { useEffect, useId, useRef, type ReactNode } from "react";
interface Props {
  children: ReactNode;
  onClose?: () => void;
  busy?: boolean;
}
export default function Modal({ children, onClose, busy = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const heading = dialog.querySelector("h2,h3,h1");
    if (heading) {
      heading.id = titleId;
      dialog.setAttribute("aria-labelledby", titleId);
    } else dialog.setAttribute("aria-label", "Details");
    dialog.showModal();
    const destructive = heading?.textContent?.toLowerCase().includes("delete");
    const cancel = [
      ...dialog.querySelectorAll<HTMLButtonElement>("button"),
    ].find((button) => /cancel/i.test(button.textContent || ""));
    const firstField = dialog.querySelector<HTMLElement>(
      "input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled)",
    );
    if (destructive && cancel) cancel.focus();
    else firstField?.focus();
    return () => {
      dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [titleId]);
  return (
    <dialog
      ref={ref}
      className="app-dialog"
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose?.();
      }}
    >
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
