import Modal from './Modal'
import Button from './Button'

function AlertDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Удалить?',
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isLoading = false,
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm?.()
      onClose?.()
    } catch {
      // stay open on error
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {message && <p className="text-zinc-400 text-sm">{message}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white"
          >
            {isLoading ? 'Удаление...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AlertDeleteModal
