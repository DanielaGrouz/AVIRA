import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import eventService from '../../services/EventService';
import '../../styles/LiveEventGallery.css';
import Config from '../../services/Config';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import AppRoutes from '../../AppRoutesConfig';

const API_BASE = Config.BASE_URL;
const PAGE_SIZE = 10;

const LiveEventGallery = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [newIds, setNewIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [totalImagesCount, setTotalImagesCount] = useState(0);
  const socketRef = useRef(null);

  const toUrl = (path) => (path?.startsWith('http') ? path : `${API_BASE}${path}`);

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await eventService.getEventGallery(eventId, currentPage, PAGE_SIZE);
        const photos = response?.data?.data?.data ?? [];
        const totalPages = response?.data?.data?.totalPages ?? 0;
        const totalItems = response?.data?.data?.totalItems ?? 0;
        setImages(photos);
        setTotalPageCount(totalPages);
        setTotalImagesCount(totalItems);
      } catch (err) {
        console.error('Could not fetch event photos:', err);
        const status = err.response?.status || err.statusCode;
        if (status === 403) {
          navigate(AppRoutes.UNAUTHORIZED);
        } else {
          navigate(AppRoutes.NOT_FOUND);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [eventId, currentPage]);

  useEffect(() => {
    if (!eventId) return;

    const socket = io(API_BASE);
    socketRef.current = socket;
    socket.emit('joinEventRoom', eventId);

    socket.on('newImageBroadcast', (data) => {
      const uid = data.id ?? data.path ?? data.imageUrl;
      setTotalImagesCount((count) => count + 1);
      setImages((prev) => {
        if (prev.some((img) => (img.id ?? img.path) === uid)) {
          setTimeout(() => setTotalImagesCount((c) => c - 1), 0);
          return prev;
        }
        const updatedImages = [{ ...data }, ...prev];
        if (updatedImages.length > PAGE_SIZE) {
          updatedImages.pop();
        }
        return updatedImages;
      });

      setNewIds((prev) => new Set(prev).add(uid));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(uid);
          return next;
        });
      }, 6000);
    });

    return () => socket.disconnect();
  }, [eventId]);

  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox) return;
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);

    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  const openLightbox = useCallback((img) => {
    setLightbox({
      src: toUrl(img.path ?? img.imageUrl),
      timestamp: img.createdAt ?? img.timestamp,
    });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const formatTime = (ts) => {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const photoLabel = totalImagesCount === 1 ? '1 photo' : `${totalImagesCount} photos`;

  return (
      <div className="gallery-container">
      <section className="live-gallery-section" aria-label="Live event photo gallery">
        <Button variant="text" className="back-btn" onClick={() => navigate(-1)}>
          &larr; Back to Event
        </Button>
        {/* Header */}
        <div className="gallery-section-header">
          <div className="gallery-section-header-left">
            <h2>Live Gallery</h2>
            {!isLoading && images.length > 0 && (
              <span className="gallery-photo-count">{photoLabel}</span>
            )}
          </div>

          <span className="gallery-live-pill" aria-label="Live feed">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="gallery-grid" aria-busy="true" aria-label="Loading photos">
            {[...Array(8)].map((_, i) => (
              <div className="gallery-skeleton-item" key={i} aria-hidden="true" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && images.length === 0 && (
          <div className="gallery-empty-state">
            <div className="gallery-empty-icon" aria-hidden="true">
              📷
            </div>
            <h3>No photos yet</h3>
            <p>
              Moments from the event will appear here as guests share them. The first shot is just
              around the corner.
            </p>
          </div>
        )}

        {/* Photo grid */}
        {!isLoading && images.length > 0 && (
            <div className="gallery-grid">
              {images.map((img, index) => {
                const uid = img.id ?? img.path ?? img.imageUrl ?? index;
                const isNew = newIds.has(uid);
                const timeStr = formatTime(img.createdAt ?? img.timestamp);
                const src = toUrl(img.path ?? img.imageUrl);

                return (
                    <div
                        className={`gallery-grid-item${isNew ? ' is-new' : ''}`}
                        key={uid}
                        onClick={() => openLightbox(img)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openLightbox(img)}
                        aria-label={`Photo ${index + 1}${timeStr ? `, taken at ${timeStr}` : ''}`}
                    >
                      <img src={src} alt={`Event moment ${index + 1}`} loading="lazy" />
                      {isNew && <span className="img-new-badge">New</span>}
                      {timeStr && (
                          <div className="img-timestamp" aria-hidden="true">
                            {timeStr}
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}

        {!isLoading && totalPageCount > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <Pagination
                  currentPage={currentPage}
                  totalPageCount={Math.ceil(totalImagesCount / PAGE_SIZE) || 1}
                  onPageChange={setCurrentPage}
              />
            </div>
        )}
      </section>

      {/* ── Lightbox — portal-style, z-index 9999 ─────── */}
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size photo"
        >
          {/* Close button */}
          <button
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close photo"
          >
            ✕
          </button>

          {/* Image wrapper — click on image does NOT close */}
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img className="lightbox-img" src={lightbox.src} alt="Full size event photo" />
            {lightbox.timestamp && (
              <div className="lightbox-caption">{formatTime(lightbox.timestamp)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveEventGallery;
