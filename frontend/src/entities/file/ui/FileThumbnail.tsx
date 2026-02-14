import React from 'react';
import {Box, Skeleton} from '@mui/material';
import type {SxProps, Theme} from '@mui/material';
import {API_URL} from '@/shared/api/axios';
import {useAuthStore} from '@/entities/user/model/store';
import {FileIcon} from './FileIcon';
import {isImageFile, isVideoFile} from './mediaPreview';
import {getCachedBlob} from './thumbnailCache';

interface FileThumbnailProps {
  name: string;
  path: string;
  size?: number;
  sx?: SxProps<Theme>;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({name, path, size = 28, sx}) => {
  const [url, setUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [inView, setInView] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const hoverTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!isImageFile(name) && !isVideoFile(name)) {
      setFailed(true);
      setLoading(false);
      return;
    }

    if (!rootRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {rootMargin: '200px'}
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [name]);

  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!inView) return;
    if (!isImageFile(name) && !isVideoFile(name)) return;

    const token = useAuthStore.getState().token;
    if (!token) {
      setFailed(true);
      setLoading(false);
      return;
    }

    const endpoint = isImageFile(name)
      ? `${API_URL}/files/preview?path=${encodeURIComponent(path)}`
      : `${API_URL}/files/download?path=${encodeURIComponent(path)}`;

    let objectUrl: string | null = null;
    const controller = new AbortController();
    setLoading(true);

    getCachedBlob(endpoint, async () => {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`},
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`preview fetch failed: ${res.status}`);
      return res.blob();
    })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setFailed(false);
      })
      .catch(() => {
        setFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [inView, name, path]);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '6px',
    objectFit: 'cover',
  };

  if (failed) {
    return (
      <Box ref={rootRef} sx={{display: 'inline-flex'}}>
        <FileIcon name={name} type="FILE" sx={{fontSize: size, ...sx}}/>
      </Box>
    );
  }

  if (loading || !url) {
    return (
      <Box ref={rootRef} sx={{display: 'inline-flex'}}>
        <Skeleton variant="rounded" width={size} height={size} sx={sx}/>
      </Box>
    );
  }

  if (isVideoFile(name)) {
    return (
      <Box ref={rootRef} sx={{display: 'inline-flex', ...sx}}>
        <Box
          component="video"
          ref={videoRef}
          src={url}
          muted
          loop
          playsInline
          preload="metadata"
          onMouseEnter={() => {
            if (hoverTimerRef.current !== null) {
              window.clearTimeout(hoverTimerRef.current);
            }
            hoverTimerRef.current = window.setTimeout(() => {
              void videoRef.current?.play().catch(() => undefined);
            }, 150);
          }}
          onMouseLeave={() => {
            if (hoverTimerRef.current !== null) {
              window.clearTimeout(hoverTimerRef.current);
              hoverTimerRef.current = null;
            }
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
          style={{...baseStyle, backgroundColor: '#111'}}
        />
      </Box>
    );
  }

  return (
    <Box ref={rootRef} sx={{display: 'inline-flex', ...sx}}>
      <Box component="img" src={url} alt={name} style={baseStyle}/>
    </Box>
  );
};
