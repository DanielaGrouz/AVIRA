import React, { useRef, useState } from 'react';
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiUpload,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import '../../styles/components/PhotoUpload.css';

const PhotoUpload = ({
  onUpload,
  title = 'Share a Moment',
  subtitle = 'Upload a photo and add it to the event gallery',
  accept = 'image/*',
  maxMB = 10,
}) => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const formatBytes = (bytes) => {
    if (bytes < 1_024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  };

  const applyFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Only image files are supported.');
      setUploadStatus('error');
      return;
    }

    if (file.size > maxMB * 1_048_576) {
      setErrorMsg(`File exceeds the ${maxMB} MB limit.`);
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setErrorMsg('');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) applyFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploadStatus === 'uploading') return;

    setUploadStatus('uploading');
    setProgress(0);

    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 18, 88));
    }, 180);

    try {
      await onUpload(selectedFile);
      clearInterval(ticker);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));
      setUploadStatus('success');
      setSelectedFile(null);
      setPreviewUrl(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setUploadStatus('idle');
      }, 4000);
    } catch (err) {
      clearInterval(ticker);
      console.error('PhotoUpload error:', err);
      setUploadStatus('error');
      setErrorMsg('Upload failed. Please try again.');
      setProgress(0);
    }
  };

  const dropZoneClass = [
    'pu-drop-zone',
    isDragging ? 'pu-drag-over' : '',
    selectedFile ? 'pu-has-file' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isUploading = uploadStatus === 'uploading';

  return (
    <div className="pu-wrapper">
      {/* Header */}
      <div className="pu-header">
        <h3 className="pu-title">{title}</h3>
        <p className="pu-subtitle">{subtitle}</p>
      </div>

      {/* Drop zone */}
      <div
        className={dropZoneClass}
        style={{ cursor: 'pointer' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Drop an image here or click to browse"
      >
        <div className="pu-drop-icon">
          <FiUploadCloud size={32} />
        </div>
        <p className="pu-drop-label">
          Drop your photo here or <strong>browse</strong>
        </p>
        <p className="pu-drop-hint">JPG, PNG, WEBP &nbsp;·&nbsp; up to {maxMB} MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="pu-hidden-input"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* File preview */}
      {selectedFile && (
        <div className="pu-preview">
          <div className="pu-preview-thumb">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" />
            ) : (
              <FiImage size={24} color="#9ca3af" />
            )}
          </div>
          <div className="pu-preview-info">
            <span className="pu-preview-name">{selectedFile.name}</span>
            <span className="pu-preview-size">{formatBytes(selectedFile.size)}</span>
          </div>
          <button
            className="pu-preview-remove"
            onClick={clearFile}
            aria-label="Remove selected file"
            disabled={isUploading}
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div
          className="pu-progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="pu-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          className={`pu-upload-btn${isUploading ? ' pu-uploading' : ''}`}
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? <FiLoader className="pu-spin-icon" /> : <FiUpload />}
          {isUploading ? 'Uploading…' : 'Upload Photo'}
        </button>
      )}

      {/* Status feedback */}
      {uploadStatus === 'success' && (
        <div className="pu-status pu-status--success" role="status">
          <FiCheckCircle size={18} />
          Photo added to the event gallery!
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="pu-status pu-status--error" role="alert">
          <FiAlertCircle size={18} />
          {errorMsg || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Tiny inline style to ensure the loader icon spins natively without needing to touch your CSS */}
      <style jsx>{`
        .pu-spin-icon {
          animation: pu-spin 1s linear infinite;
        }
        @keyframes pu-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoUpload;
