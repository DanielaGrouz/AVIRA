import React, { useState, useRef } from 'react';
import EventService from '../../services/EventService';
import ActionResultModal from './ActionResultModal';

const EventSmartActions = ({ eventId, eventLocation, onEventUpdate }) => {
    const [activeAction, setActiveAction] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, type: null, title: '', data: null, image: null, text: '' });
    const fileInputRef = useRef(null);

    const handleAction = async (type, title) => {
        setActiveAction(type);
        try {
            let res;
            if (type === 'invite') res = await EventService.generateInvite(eventId);
            else if (type === 'shopping') res = await EventService.generateShoppingList(eventId);
            else if (type === 'tasks') res = await EventService.generateTaskList(eventId);
            else if (type === 'stores') res = await EventService.findStores(eventLocation || 'Israel', eventId);

            if (type === 'invite') {
                const imageUrl = URL.createObjectURL(res.data);
                setModalState({ isOpen: true, type, title, image: imageUrl, blob: res.data });
            } else {
                let data = res.data?.data || res.data;
                if (typeof data === 'string' && data.trim().startsWith('[')) {
                    try { data = JSON.parse(data); } catch (e) {}
                }
                setModalState({ isOpen: true, type, title, data, text: typeof data === 'object' ? JSON.stringify(data, null, 2) : data });
            }
        } catch (error) {
            setModalState({ isOpen: true, type: 'error', title: 'Error', text: 'Action failed.' });
        } finally {
            setActiveAction(null);
        }
    };

    const handleUploadClick = () => fileInputRef.current.click();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setActiveAction('upload');
        try {
            await EventService.saveInvitation(eventId, file);
            await onEventUpdate();
            setModalState({ isOpen: true, type: 'success', title: 'Success', text: 'Invitation uploaded!' });
        } catch (error) {
            setModalState({ isOpen: true, type: 'error', title: 'Error', text: 'Failed to upload invitation.' });
        } finally {
            setActiveAction(null);
            event.target.value = null;
        }
    };

    return (
        <div className="event-tools-section">
            <div className="event-tools-buttons">
                <button className={`tool-btn outline-btn`} onClick={() => handleAction('invite', 'Generated Invitation')} disabled={activeAction !== null}>
                    ✨ {activeAction === 'invite' ? 'Generating...' : 'Generate Invite'}
                </button>
                <button className={`tool-btn outline-btn`} onClick={() => handleAction('shopping', 'Shopping List')} disabled={activeAction !== null}>
                    🛒 {activeAction === 'shopping' ? 'Generating...' : 'Shopping List'}
                </button>
                <button className={`tool-btn outline-btn`} onClick={() => handleAction('tasks', 'Generated Tasks')} disabled={activeAction !== null}>
                    📋 {activeAction === 'tasks' ? 'Generating...' : 'Generate Tasks'}
                </button>
                <button className={`tool-btn outline-btn`} onClick={() => handleAction('stores', 'Nearby Stores')} disabled={activeAction !== null}>
                    📍 {activeAction === 'stores' ? 'Searching...' : 'Find Stores'}
                </button>
                <button className={`tool-btn primary-btn`} onClick={handleUploadClick} disabled={activeAction !== null}>
                    📤 {activeAction === 'upload' ? 'Uploading...' : 'Upload Invitation'}
                </button>

                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
            </div>

            <ActionResultModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                modalState={modalState}
                eventId={eventId}
                onEventUpdate={onEventUpdate}
            />
        </div>
    );
};

export default EventSmartActions;