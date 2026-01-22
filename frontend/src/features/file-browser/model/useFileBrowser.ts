import React, {useState} from 'react';
import type {ViewMode} from '@/widgets/file-table/ui/FileTable';
import {useFiles} from '@/entities/file/model/useFiles';

export const useFileBrowser = (initialPath: string = '/') => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const {data, isLoading, error, refetch} = useFiles(currentPath);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const toggleViewMode = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return {
    currentPath,
    viewMode,
    data,
    isLoading,
    error,
    refetch,
    navigateTo,
    toggleViewMode,
  };
};
