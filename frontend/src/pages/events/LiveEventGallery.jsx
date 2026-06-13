import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import eventService from '../../services/EventService';
import '../../styles/LiveEventGallery.css';

const API_BASE = 'http://localhost:3000';

const LiveEventGallery = () => {
    const { id: eventId } = useParams();

    const [images, setImages]       = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lightbox, setLightbox]   = useState(null);   // { src, timestamp }
    const [newIds, setNewIds]       = useState(new Set());

    const socketRef = useRef(null);

    // ── Build the full image URL from a path ─────────────────
    const toUrl = (path) =>
        path?.startsWith('http') ? path : `${API_BASE}${path}`;

    // ── Fetch initial photos ──────────────────────────────────
    useEffect(() => {
        if (!eventId) return;

        const load = async () => {
            setIsLoading(true);
            try {
                const response = await eventService.getEventGallery(eventId, 1, 10);
                const photos = response?.data?.data?.data ?? [];
                setImages(photos);
            } catch (err) {
                console.error('Could not fetch event photos:', err);
                setImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [eventId]);

    // ── Socket.io realtime listener ───────────────────────────
    useEffect(() => {
        if (!eventId) return;

        const socket = io(API_BASE);
        socketRef.current = socket;
        socket.emit('joinEventRoom', eventId);

        socket.on('newImageBroadcast', (data) => {
            const uid = data.id ?? data.path ?? data.imageUrl;

            setImages((prev) => {
                if (prev.some((img) => (img.id ?? img.path) === uid)) return prev;
                return [{ ...data }, ...prev];
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

    // ── Lightbox keyboard + scroll lock ──────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (!lightbox) return;
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', onKey);

        // Lock scroll while lightbox is open
        if (lightbox) document.body.style.overflow = 'hidden';
        else          document.body.style.overflow  = '';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox]);

    const openLightbox = useCallback((img) => {
        setLightbox({ src: toUrl(img.path ?? img.imageUrl), timestamp: img.createdAt ?? img.timestamp });
    }, []);

    const closeLightbox = useCallback(() => setLightbox(null), []);

    const formatTime = (ts) => {
        if (!ts) return null;
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const photoLabel = images.length === 1 ? '1 photo' : `${images.length} photos`;

    // ── Render ────────────────────────────────────────────────
    return (
        <>
            <section className="live-gallery-section" aria-label="Live event photo gallery">

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
                        <div className="gallery-empty-icon" aria-hidden="true">📷</div>
                        <h3>No photos yet</h3>
                        <p>
                            Moments from the event will appear here as guests share them.
                            The first shot is just around the corner.
                        </p>
                    </div>
                )}

                {/* Photo grid */}
                {!isLoading && images.length > 0 && (
                    <div className="gallery-grid">
                        {images.map((img, index) => {
                            const uid     = img.id ?? img.path ?? img.imageUrl ?? index;
                            const isNew   = newIds.has(uid);
                            const timeStr = formatTime(img.createdAt ?? img.timestamp);
                            const src     = toUrl(img.path ?? img.imageUrl);

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
                                    <img
                                        src={src}
                                        alt={`Event moment ${index + 1}`}
                                        loading="lazy"
                                    />

                                    {isNew && (
                                        <span className="img-new-badge" aria-label="New photo">
                                            New
                                        </span>
                                    )}

                                    {timeStr && (
                                        <div className="img-timestamp" aria-hidden="true">
                                            <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            {timeStr}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        aria-label="Close photo"
                    >
                        ✕
                    </button>

                    {/* Image wrapper — click on image does NOT close */}
                    <div
                        className="lightbox-inner"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            className="lightbox-img"
                            src={lightbox.src}
                            alt="Full size event photo"
                        />
                        {lightbox.timestamp && (
                            <div className="lightbox-caption">
                                {formatTime(lightbox.timestamp)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default LiveEventGallery;