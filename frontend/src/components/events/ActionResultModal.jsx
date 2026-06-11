import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import EventService from '../../services/EventService';

const ActionResultModal = ({ isOpen, onClose, modalState, eventId, onEventUpdate, isLoading = false }) => {
    const [addedSuggestedTasks, setAddedSuggestedTasks] = useState(new Set());
    const [isSavingInvite, setIsSavingInvite] = useState(false);

    // Provide default values in case modalState is empty during loading
    const { type, title = 'AI Generator', data, image, text, blob } = modalState || {};

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
            if (onEventUpdate) await onEventUpdate();
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

            const payload = { eventId, title: titleStr, status: 'pending', priority: 'medium' };
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
        <Modal isOpen={isOpen} onClose={handleClose} title={isLoading ? "AI is thinking..." : title}>
            <div className="modal-body">
                {isLoading ? (
                    // --- LOADING SPINNER UI ---
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '5px solid #e2e8f0',
                            borderTop: '5px solid #3182ce',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ marginTop: '20px', color: '#4a5568', fontSize: '1.1rem', fontWeight: '500' }}>
                            Working some AI magic... ✨
                        </p>
                        {/* Inline keyframes for the spinner so you don't need a separate CSS file */}
                        <style>
                            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                        </style>
                    </div>
                ) : (
                    // --- NORMAL CONTENT UI ---
                    <div
                        className="result-content-box"
                        style={(image || type === 'tasks' || type === 'shopping' || type === 'stores') ? { backgroundColor: 'transparent', border: 'none', padding: 0 } : {}}
                    >
                        {/* 1. Image Render */}
                        {image ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img src={image} alt="Generated Invite" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', objectFit: 'contain' }} />
                                </div>
                            )

                            /* 2. Stores Map Render */
                            : type === 'stores' && Array.isArray(data) ? (
                                    <div className="stores-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {data.map((store, index) => {
                                            const sLat = parseFloat(store.lat);
                                            const sLon = parseFloat(store.lon);
                                            const bbox = `${sLon - 0.005},${sLat - 0.005},${sLon + 0.005},${sLat + 0.005}`;

                                            return (
                                                <div key={index} className="store-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <h3 style={{ margin: '0 0 6px 0', color: '#1a202c', fontSize: '1.1rem' }}>🏪 {store.storeName}</h3>
                                                            <div style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                                <strong>For Task:</strong> <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>{store.task}</span><br/>

                                                                {store.address !== "Address not listed" && (
                                                                    <>
                                                                        <strong>Address:</strong> {store.address}<br/>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                                                        <iframe
                                                            title={`map-${index}`}
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            scrolling="no"
                                                            marginHeight="0"
                                                            marginWidth="0"
                                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${sLat},${sLon}`}
                                                        ></iframe>
                                                    </div>

                                                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                                        <a
                                                            href={`https://www.google.com/maps/dir/?api=1&destination=${sLat},${sLon}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#3182ce', color: '#fff', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500', transition: 'background-color 0.2s' }}
                                                        >
                                                            📍 Navigate
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )

                                /* 3. Tasks / Shopping Lists Render */
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

                                    /* 4. Raw Text / Success Messages Render */
                                    : (
                                        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                            {text}
                                        </div>
                                    )}
                    </div>
                )}
            </div>

            <div className="modal-footer">
                {!isLoading && type === 'invite' && image && (
                    <Button variant="primary" onClick={handleSaveGeneratedInvite} disabled={isSavingInvite}>
                        {isSavingInvite ? 'Saving...' : 'Save to Event'}
                    </Button>
                )}
                {!isLoading && image && (
                    <a href={image} download={`invitation_${eventId}.png`} style={{ textDecoration: 'none' }}>
                        <Button variant="success" type="button">Download Image</Button>
                    </a>
                )}
                <Button variant="text" onClick={handleClose} disabled={isLoading}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};

export default ActionResultModal;