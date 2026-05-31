import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import EventService from '../../services/EventService';

const ActionResultModal = ({ isOpen, onClose, modalState, eventId, onEventUpdate }) => {
    const [addedSuggestedTasks, setAddedSuggestedTasks] = useState(new Set());
    const [isSavingInvite, setIsSavingInvite] = useState(false);

    const { type, title, data, image, text, blob } = modalState;

    // Reset state when modal closes
    const handleClose = () => {
        setAddedSuggestedTasks(new Set());
        onClose();
    };

    const handleSaveGeneratedInvite = async () => {
        if (!blob) return;
        setIsSavingInvite(true);
        try {
            const file = new File([blob], `generated_invite_${eventId}.png`, { type: 'image/png' });
            await EventService.saveInvitation(eventId, file);
            if (onEventUpdate) await onEventUpdate(); // Refresh the parent page data
            handleClose();
        } catch (error) {
            console.error("Failed to save generated invite", error);
            alert("Failed to save invitation.");
        } finally {
            setIsSavingInvite(false);
        }
    };

    const handleAddSuggestedTask = async (itemObj, index, isShopping = false) => {
        try {
            let titleStr = "New Task";
            if (isShopping) {
                const qtyUnit = [itemObj.quantity, itemObj.unit].filter(Boolean).join(' ');
                titleStr = qtyUnit ? `Buy ${itemObj.item} (${qtyUnit})` : `Buy ${itemObj.item}`;
            } else {
                titleStr = itemObj.task || itemObj.title || "New Task";
            }

            const payload = { eventId, title: titleStr, status: 'Pending', priority: 'Medium' };
            await EventService.addTask(payload);
            setAddedSuggestedTasks(prev => new Set(prev).add(index));

            if (onEventUpdate) {
                await onEventUpdate();
            }
        } catch (error) {
            console.error("Failed to add suggested item as task", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <div className="modal-body">
                <div
                    className="result-content-box"
                    style={(image || type === 'tasks' || type === 'shopping') ? { backgroundColor: 'transparent', border: 'none', padding: 0 } : {}}
                >
                    {/* 1. Image Render */}
                    {image ? (
                            <div style={{ textAlign: 'center' }}>
                                <img src={image} alt="Generated Invite" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', objectFit: 'contain' }} />
                            </div>
                        )

                        /* 2. Tasks / Shopping Lists Render */
                        : (type === 'tasks' || type === 'shopping') && Array.isArray(data) ? (
                                <div className="suggested-items-container">
                                    {data.map((item, index) => {
                                        const isShopping = type === 'shopping';
                                        const mainText = isShopping ? item.item : (item.task || item.title || "New Task");
                                        const subText = isShopping
                                            ? [item.quantity, item.unit].filter(Boolean).join(' ')
                                            : (item.daysBefore !== undefined ? `${item.daysBefore} days before` : '');

                                        return (
                                            <div key={index} className="suggested-item-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                                                <div className="suggested-item-info">
                                                    <strong>{mainText}</strong> <br/>
                                                    {subText && <span className="suggested-item-meta" style={{ color: '#666', fontSize: '0.85em' }}>{subText}</span>}
                                                </div>
                                                <Button
                                                    variant={addedSuggestedTasks.has(index) ? "success" : "primary"}
                                                    onClick={() => handleAddSuggestedTask(item, index, isShopping)}
                                                    disabled={addedSuggestedTasks.has(index)}
                                                    style={{ minWidth: '90px', height: '40px' }}
                                                >
                                                    {addedSuggestedTasks.has(index) ? "Added ✓" : "+ Add"}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )

                            /* 3. Raw Text / Success Messages Render */
                            : (
                                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                    {text}
                                </div>
                            )}
                </div>
            </div>

            <div className="modal-footer">
                {type === 'invite' && image && (
                    <Button variant="primary" onClick={handleSaveGeneratedInvite} disabled={isSavingInvite}>
                        {isSavingInvite ? 'Saving...' : 'Save to Event'}
                    </Button>
                )}
                {image && (
                    <a href={image} download={`invitation_${eventId}.png`} style={{ textDecoration: 'none' }}>
                        <Button variant="success" type="button">Download Image</Button>
                    </a>
                )}
                <Button variant="text" onClick={handleClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};

export default ActionResultModal;