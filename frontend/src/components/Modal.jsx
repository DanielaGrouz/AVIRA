import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/Modal.css';

/**
 * AVIRA Modal
 *
 * Renders via React Portal directly into document.body — this is the ONLY
 * reliable way to guarantee `position: fixed` works correctly when any
 * ancestor has `transform`, `filter`, `backdrop-filter`, `will-change`,
 * or `animation` applied (all of which create new stacking contexts and
 * break fixed positioning).
 *
 * Usage:
 *   <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Guest">
 *     <p>Modal body content here</p>
 *   </Modal>
 */
export default function Modal({ isOpen, onClose, title, children, footer }) {
    // Lock body scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Portal teleports the modal OUT of the React tree's DOM position
    // and appends it directly to document.body
    return createPortal(
        <div
            className="modal-overlay"
            onClick={(e) => {
                // Close when clicking the backdrop, not the modal itself
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="modal-container" role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body   // ← the key: renders outside any stacking context
    );
}