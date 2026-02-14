import React from 'react';
import {Box} from '@mui/material';
import type {SxProps, Theme} from '@mui/material';
import {API_URL} from '@/shared/api/axios';
import {useAuthStore} from '@/entities/user/model/store';
import {FileIcon} from './FileIcon';
import {isImageFile, isVideoFile} from './mediaPreview';

interface FileThumbnailProps {
  name: string;
  path: string;
  size?: number;
  sx?: SxProps<Theme>;
}

export const FileThumbnail: React.FC<FileThumbnailProps> = ({name, path, size = 28, sx}) => {
  const [url, setUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!isImageFile(name) && !isVideoFile(name)) {
      setUrl(null);
      setFailed(true);
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      setFailed(true);
      return;
    }

    const endpoint = isImageFile(name)
      ? `${API_URL}/files/preview?path=${encodeURIComponent(path)}`
      : `${API_URL}/files/download?path=${encodeURIComponent(path)}`;

    let objectUrl: string | null = null;
    const controller = new AbortController();

    fetch(endpoint, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`},
      signal: controller.signal,
    })
      .then((res) => {
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
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [name, path]);

  if (failed || !url) {
    return <FileIcon name={name} type="FILE" sx={{fontSize: size, ...sx}}/>;
  }

  if (isVideoFile(name)) {
    return (
      <Box
        component="video"
        src={url}
        muted
        playsInline
        preload="metadata"
        sx={{
          width: size,
          height: size,
          borderRadius: '6px',
          objectFit: 'cover',
          backgroundColor: '#111',
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={url}
      alt={name}
      sx={{
        width: size,
        height: size,
        borderRadius: '6px',
        objectFit: 'cover',
        ...sx,
      }}
    />
  );
};
