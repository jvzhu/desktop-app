interface ModalDialogProps {
  title: string;
  message: string;
  open: boolean;
  onClose(): void;
}

export function ModalDialog({ title, message, open, onClose }: ModalDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
