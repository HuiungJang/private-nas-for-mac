import {useEffect, useState} from 'react';
import type {ViewMode} from '@/widgets/file-table/ui/FileTable';
import {useFiles} from '@/entities/file/model/useFiles';

export const useFileBrowser = (initialPath: string = '/') => {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const {data, isLoading, error, refetch} = useFiles(currentPath);

  // Clear selection on path change
  useEffect(() => {
    setSelectedFiles(new Set());
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const toggleViewMode = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSelectionChange = (newSelection: Set<string>) => {
    setSelectedFiles(newSelection);
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  return {
    currentPath,
    viewMode,
    selectedFiles,
    data,
    isLoading,
    error,
    refetch,
    navigateTo,
    toggleViewMode,
    handleSelectionChange,
    clearSelection,
  };
};
