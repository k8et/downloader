import { useEffect, useRef, useState } from 'react'
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ANIM_DURATION = 200;

function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cachedContent = useRef({ title, children });

  if (isOpen) {
    cachedContent.current = { title, children };
  }

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), ANIM_DURATION);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        setTimeout(onClose, ANIM_DURATION);
      }
    };
    if (mounted) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mounted, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, ANIM_DURATION);
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  if (!mounted) return null;

  const { title: displayTitle, children: displayChildren } = cachedContent.current;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md transition-all duration-200 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
          <h2 className="text-lg font-medium text-zinc-100">{displayTitle}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{displayChildren}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
