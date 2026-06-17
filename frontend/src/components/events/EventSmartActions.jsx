import React, { useState, useRef } from 'react';
import EventService from '../../services/EventService';
import ActionResultModal from './ActionResultModal';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../AppRoutesConfig';

const EventSmartActions = ({ eventId, onEventUpdate }) => {
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    title: '',
    data: null,
    image: null,
    text: '',
  });
  const fileInputRef = useRef(null);

  const executeFindStores = (eventId) => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          try {
            const response = await EventService.findStores(userLocation, eventId);
            resolve(response);
          } catch (err) {
            reject(err);
          }
        },
        (error) => reject(error)
      );
    });
  };

  const handleAction = async (type, title) => {
    setActiveAction(type);

    setModalState({ isOpen: true, type, title, data: null, image: null, text: '', blob: null });

    try {
      let res;
      if (type === 'invite') {
        res = await EventService.generateInvite(eventId);
      } else if (type === 'shopping') {
        res = await EventService.generateShoppingList(eventId);
      } else if (type === 'tasks') {
        res = await EventService.generateTaskList(eventId);
      } else if (type === 'stores') {
        res = await executeFindStores(eventId);
      }

      if (type === 'invite') {
        const imageUrl = URL.createObjectURL(res.data);
        setModalState({ isOpen: true, type, title, image: imageUrl, blob: res.data });
      } else {
        let data = res.data?.data || res.data;
        if (typeof data === 'string' && data.trim().startsWith('[')) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        setModalState({
          isOpen: true,
          type,
          title,
          data,
          text: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
        });
      }
    } catch (error) {
      console.error('Action failed:', error);

      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred. Please try again.';

      setModalState({ isOpen: true, type: 'error', title: 'Action Failed', text: errorMessage });
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
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Success',
        text: 'Invitation uploaded successfully!',
      });
    } catch (error) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error',
        text: 'Failed to upload invitation.',
      });
    } finally {
      setActiveAction(null);
      event.target.value = null;
    }
  };

  const isAiLoading = activeAction !== null && activeAction !== 'upload';
  return (
    <div className="event-tools-section">
      <div className="event-tools-buttons">
        <button
          className="tool-btn outline-btn"
          onClick={() => navigate(AppRoutes.getEventGallery(eventId))}
        >
          📸 {'Live Gallery'}
        </button>

        <button
          className="tool-btn outline-btn"
          onClick={() => handleAction('invite', 'Generated Invitation')}
          disabled={activeAction !== null}
        >
          ✨ {activeAction === 'invite' ? 'Generating...' : 'Generate Invite'}
        </button>
        <button
          className="tool-btn outline-btn"
          onClick={() => handleAction('shopping', 'Shopping List')}
          disabled={activeAction !== null}
        >
          🛒 {activeAction === 'shopping' ? 'Generating...' : 'Generate Shopping List'}
        </button>
        <button
          className="tool-btn outline-btn"
          onClick={() => handleAction('tasks', 'Generated Tasks')}
          disabled={activeAction !== null}
        >
          📋 {activeAction === 'tasks' ? 'Generating...' : 'Generate Tasks'}
        </button>
        <button
          className="tool-btn outline-btn"
          onClick={() => handleAction('stores', 'Nearby Stores')}
          disabled={activeAction !== null}
        >
          📍 {activeAction === 'stores' ? 'Searching...' : 'Find Stores'}
        </button>
        <button
          className="tool-btn primary-btn"
          onClick={handleUploadClick}
          disabled={activeAction !== null}
        >
          📤 {activeAction === 'upload' ? 'Uploading...' : 'Upload Invitation'}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>

      <ActionResultModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        modalState={modalState}
        eventId={eventId}
        onEventUpdate={onEventUpdate}
        isLoading={isAiLoading}
      />
    </div>
  );
};

export default EventSmartActions;
