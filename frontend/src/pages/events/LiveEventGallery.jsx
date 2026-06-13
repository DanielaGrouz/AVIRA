import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import '../../styles/LiveEventGallery.css';
import {useParams} from "react-router-dom";
import eventService from "../../services/EventService";

const API_BASE = 'http://localhost:3000'; // adjust to your backend URL

const LiveEventGallery = () => {
    const { id: eventId } = useParams();
    const [images, setImages] = useState([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading]     = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [newIds, setNewIds]           = useState(new Set());    // tracks freshly arrived images
    const socketRef                     = useRef(null);
    const isGalleryOpenRef              = useRef(isGalleryOpen); // stable ref for socket callback

    // Keep ref in sync with state
    useEffect(() => {
        isGalleryOpenRef.current = isGalleryOpen;
    }, [isGalleryOpen]);

    const fetchInitialImages = async () => {
        setIsLoading(true);
        try {
            const response = await eventService.getEventGallery(eventId, 1, 5);
            setImages(response.data.data.data);
        } catch (err) {
            console.error('Could not fetch initial event photos:', err);
        } finally {
            setIsLoading(false);
        }
    };
    console.log(images);

    useEffect(() => {
        if (!eventId) return;
        fetchInitialImages()
    }, [eventId]);

    useEffect(() => {
        if (!eventId) return;

        const socket = io(API_BASE);
        socketRef.current = socket;

        socket.emit('joinEventRoom', eventId);

        socket.on('newImageBroadcast', (data) => {
            console.error(data);
            const id = data.id ?? data.imageUrl; // fall back to URL as unique key

            setImages((prev) => {
                // Avoid duplicates
                if (prev.some((img) => (img.id ?? img.path) === id)) return prev;
                return [{ ...data, _isNew: true }, ...prev];
            });

            // Mark as "new" for glow animation
            setNewIds((prev) => new Set(prev).add(id));
            setTimeout(() => {
                setNewIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }, 6000); // badge fades after 6 s

            if (!isGalleryOpenRef.current) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [eventId]);

    // ── Gallery open / close ──────────────────────────────────
    const openGallery = useCallback(() => {
        setIsGalleryOpen(true);
        setUnreadCount(0);
    }, []);

    const closeGallery = useCallback(() => {
        setIsGalleryOpen(false);
    }, []);

    // Close gallery on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (lightboxSrc) {
                    setLightboxSrc(null);
                } else {
                    closeGallery();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxSrc, closeGallery]);

    // ── Helpers ───────────────────────────────────────────────
    const formatTime = (ts) => {
        if (!ts) return null;
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const photoLabel = images.length === 1 ? '1 photo' : `${images.length} photos`;

    // ── Render ────────────────────────────────────────────────

    // Nothing at all if no images and not loading — don't render the FAB
    if (!isLoading && images.length === 0 && !isGalleryOpen) {
        return null;
    }

    return (
        <>
            {/* ── Floating Action Button ─────────────────── */}
            {(images.length > 0 || isLoading) && (
                <button
                    className="floating-gallery-btn"
                    onClick={openGallery}
                    aria-label={`Open event gallery${unreadCount > 0 ? `, ${unreadCount} new` : ''}`}
                >
                    <span className="fab-icon">📸</span>
                    Event Gallery
                    {unreadCount > 0 && (
                        <span className="gallery-badge" aria-live="polite">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* ── Fullscreen Sheet Modal ─────────────────── */}
            {isGalleryOpen && (
                <div
                    className="gallery-modal-overlay"
                    onClick={(e) => e.target === e.currentTarget && closeGallery()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Live event photo gallery"
                >
                    <div className="gallery-modal-content">
                        {/* Drag handle */}
                        <div className="gallery-drag-handle" aria-hidden="true" />

                        {/* Header */}
                        <div className="gallery-header">
                            <div className="gallery-header-left">
                                <h2>Live Event Photos</h2>
                                {!isLoading && (
                                    <span className="gallery-photo-count">{photoLabel}</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="gallery-live-pill" aria-label="Live">
                                    <span className="live-dot" aria-hidden="true" />
                                    Live
                                </span>
                                <button
                                    className="gallery-close-btn"
                                    onClick={closeGallery}
                                    aria-label="Close gallery"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="gallery-scroll-area">
                            {/* Loading skeletons */}
                            {isLoading && (
                                <div className="masonry-grid" aria-busy="true" aria-label="Loading photos">
                                    {[...Array(6)].map((_, i) => (
                                        <div className="masonry-skeleton" key={i} aria-hidden="true" />
                                    ))}
                                </div>
                            )}

                            {/* Empty state (after loading) */}
                            {!isLoading && images.length === 0 && (
                                <div className="gallery-empty-state">
                                    <div className="gallery-empty-icon" aria-hidden="true">📷</div>
                                    <h3>No photos yet</h3>
                                    <p>
                                        Photos will appear here as guests share moments from the event.
                                        Check back soon — the first shots are on their way.
                                    </p>
                                </div>
                            )}

                            {/* Photo grid */}
                            {!isLoading && images.length > 0 && (
                                <div className="masonry-grid">
                                    {images.map((img, index) => {
                                        const id       = img.id ?? img.imageUrl;
                                        const isNew    = newIds.has(id);
                                        const timeStr  = formatTime(img.timestamp);

                                        return (
                                            <div
                                                className={`masonry-item${isNew ? ' is-new' : ''}`}
                                                key={id ?? index}
                                                onClick={() => setLightboxSrc(img.imageUrl)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && setLightboxSrc(img.imageUrl)}
                                                aria-label={`Photo ${index + 1}${timeStr ? ` taken at ${timeStr}` : ''}`}
                                            >
                                                <img
                                                    src={`http://localhost:3000${img.path}`}
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
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lightbox ───────────────────────────────── */}
            {lightboxSrc && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxSrc(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Full-size photo"
                >
                    <button
                        className="lightbox-close"
                        onClick={() => setLightboxSrc(null)}
                        aria-label="Close photo"
                    >
                        ✕
                    </button>
                    <img
                        className="lightbox-img"
                        src={lightboxSrc}
                        alt="Full size event photo"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default LiveEventGallery;