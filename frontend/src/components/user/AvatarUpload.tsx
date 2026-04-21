import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { authApi } from '../../api/auth';

interface AvatarUploadProps {
  currentImage?: string | null;
  username?: string;
  onSuccess: (url: string) => void;
}

export default function AvatarUpload({
  currentImage,
  username,
  onSuccess,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const localObjectUrl = useRef<string | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  const avatarLetter = username?.charAt(0).toUpperCase() ?? '?';

  const clearLocalObjectUrl = useCallback(() => {
    if (localObjectUrl.current) {
      URL.revokeObjectURL(localObjectUrl.current);
      localObjectUrl.current = null;
    }
  }, []);

  const clearSuccessTimer = useCallback(() => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setPreviewUrl(currentImage ?? null);
  }, [currentImage]);

  useEffect(() => {
    return () => {
      clearLocalObjectUrl();
      clearSuccessTimer();
    };
  }, [clearLocalObjectUrl, clearSuccessTimer]);

  const processFile = useCallback(
    async (file: File) => {
      const lowerFileName = file.name.toLowerCase();
      const isSupportedImage =
        ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type.toLowerCase()) ||
        /\.(png|jpe?g)$/.test(lowerFileName);

      if (!isSupportedImage) {
        setUploadError('Only PNG and JPG images are allowed.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setUploadError('Images must be 2 MB or smaller.');
        return;
      }

      clearLocalObjectUrl();

      const objectUrl = URL.createObjectURL(file);
      localObjectUrl.current = objectUrl;

      setPreviewUrl(objectUrl);
      setUploadError('');
      setUploadSuccess(false);
      clearSuccessTimer();

      try {
        setUploading(true);
        const { url } = await authApi.uploadAvatar(file);

        clearLocalObjectUrl();
        setPreviewUrl(url);
        onSuccess(url);
        setUploadSuccess(true);
        successTimeoutRef.current = window.setTimeout(() => {
          setUploadSuccess(false);
          successTimeoutRef.current = null;
        }, 2500);
      } catch {
        clearLocalObjectUrl();
        setUploadError('Upload failed. Please try again.');
        setPreviewUrl(currentImage ?? null);
      } finally {
        setUploading(false);
      }
    },
    [clearLocalObjectUrl, clearSuccessTimer, currentImage, onSuccess]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        void processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    event.target.value = '';
  };

  const borderColor = uploading
    ? 'rgba(45,212,191,0.35)'
    : isDragging
      ? 'rgba(45,212,191,0.75)'
      : uploadSuccess
        ? 'rgba(45,212,191,0.60)'
        : uploadError
          ? 'rgba(248,113,113,0.50)'
          : 'rgba(255,255,255,0.14)';

  const glowShadow = isDragging
    ? '0 0 0 4px rgba(45,212,191,0.12), 0 0 36px rgba(45,212,191,0.22)'
    : uploadSuccess
      ? '0 0 0 3px rgba(45,212,191,0.18), 0 0 24px rgba(45,212,191,0.16)'
      : 'none';

  return (
    <div>
      <style>{`
        .avatar-zone { transition: border-color 0.25s, box-shadow 0.25s, background 0.25s; }
        .avatar-zone:hover .avatar-overlay { opacity: 1; }
        .avatar-overlay {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: rgba(6,12,24,0.62);
          display: grid; place-items: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .avatar-zone:hover { border-color: rgba(45,212,191,0.45) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes avatarPop {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .avatar-img { animation: avatarPop 0.3s ease; }
        @keyframes successRing {
          0%   { box-shadow: 0 0 0 0 rgba(45,212,191,0.5); }
          60%  { box-shadow: 0 0 0 10px rgba(45,212,191,0); }
          100% { box-shadow: 0 0 0 0 rgba(45,212,191,0); }
        }
        .avatar-success { animation: successRing 0.8s ease; }
      `}</style>

      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--app-muted)',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        Profile Avatar
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div
          className={`avatar-zone${uploadSuccess ? ' avatar-success' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: `2px ${isDragging ? 'solid' : 'dashed'} ${borderColor}`,
            background: previewUrl ? 'transparent' : 'rgba(45,212,191,0.04)',
            display: 'grid',
            placeItems: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: glowShadow,
          }}
        >
          {previewUrl ? (
            <img
              key={previewUrl}
              src={previewUrl}
              alt="avatar preview"
              className="avatar-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 34,
                fontWeight: 800,
                color: 'rgba(45,212,191,0.40)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {avatarLetter}
            </span>
          )}

          <div className="avatar-overlay">
            {uploading ? (
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                  borderTopColor: '#2dd4bf',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            ) : uploadSuccess ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--app-ink)' }}>
            {uploading
              ? 'Uploading...'
              : uploadSuccess
                ? 'Avatar updated.'
                : previewUrl
                  ? 'Click or drop to replace your avatar.'
                  : 'Upload your avatar.'}
          </p>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 12,
              color: 'var(--app-muted)',
              lineHeight: 1.6,
            }}
          >
            Supports PNG and JPG files up to 2 MB.
            <br />
            Click the avatar or drag a file into the drop zone.
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 10,
              border: '1px solid rgba(45,212,191,0.35)',
              background: 'rgba(45,212,191,0.08)',
              color: '#2dd4bf',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(event) => {
              if (!uploading) {
                event.currentTarget.style.background = 'rgba(45,212,191,0.16)';
                event.currentTarget.style.borderColor = 'rgba(45,212,191,0.60)';
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'rgba(45,212,191,0.08)';
              event.currentTarget.style.borderColor = 'rgba(45,212,191,0.35)';
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Choose file
          </button>
        </div>
      </div>

      {uploadError ? (
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {uploadError}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
