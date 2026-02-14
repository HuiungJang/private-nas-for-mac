import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import SearchIcon from '@mui/icons-material/Search';
import {AppBreadcrumbs} from '@/shared/ui/AppBreadcrumbs';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import {useFileBrowser} from '../model/useFileBrowser';
import {FileActionsToolbar} from '@/features/file-actions/ui/FileActionsToolbar';
import {MoveFileModal} from '@/features/file-actions/ui/MoveFileModal';
import {useFileActions} from '@/features/file-actions/model/useFileActions';
import {fileApi} from '@/entities/file/api/fileApi';
import {useNotificationStore} from '@/shared/model/useNotificationStore';
import type {FileNode} from '@/entities/file/model/types';
import {FileThumbnail} from '@/entities/file/ui/FileThumbnail';
import {isPreviewableMedia} from '@/entities/file/ui/mediaPreview';

type SortMode = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';
type FilterPreset = 'all' | 'recent' | 'large' | 'media' | 'documents';
const TRASH_PATH = '/.trash';

const sortFiles = (items: FileNode[], mode: SortMode) => {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'DIRECTORY' ? -1 : 1;
    }

    if (mode === 'name-asc') return a.name.localeCompare(b.name);
    if (mode === 'name-desc') return b.name.localeCompare(a.name);

    const aTime = new Date(a.lastModified).getTime();
    const bTime = new Date(b.lastModified).getTime();
    return mode === 'date-desc' ? bTime - aTime : aTime - bTime;
  });

  return sorted;
};

export const FileBrowser: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    viewMode,
    selectedFiles,
    currentPath,
    navigateTo,
    toggleViewMode,
    handleSelectionChange,
    clearSelection,
    refetch,
  } = useFileBrowser();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [pathInput, setPathInput] = React.useState(currentPath);
  const [tabs, setTabs] = React.useState<Array<{id: string; path: string}>>([{id: 'tab-1', path: currentPath}]);
  const [activeTabId, setActiveTabId] = React.useState('tab-1');
  const [sortMode, setSortMode] = React.useState<SortMode>(() => {
    const saved = localStorage.getItem('fileBrowser.sortMode');
    if (saved === 'name-asc' || saved === 'name-desc' || saved === 'date-desc' || saved === 'date-asc') return saved;
    return 'name-asc';
  });
  const [filterPreset, setFilterPreset] = React.useState<FilterPreset>(() => {
    const saved = localStorage.getItem('fileBrowser.filterPreset');
    if (saved === 'all' || saved === 'recent' || saved === 'large' || saved === 'media' || saved === 'documents') return saved;
    return 'all';
  });
  const [focusedFile, setFocusedFile] = React.useState<FileNode | null>(null);
  const [contextAnchor, setContextAnchor] = React.useState<null | HTMLElement>(null);
  const [isDropzoneActive, setIsDropzoneActive] = React.useState(false);
  const [draggingCount, setDraggingCount] = React.useState(0);
  const [pendingMove, setPendingMove] = React.useState<{ sourceNames: string[]; targetDirectoryName: string } | null>(null);
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fileBrowser.favorites') ?? '[]'); } catch { return []; }
  });
  const [recentPaths, setRecentPaths] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('fileBrowser.recentPaths') ?? '[]'); } catch { return []; }
  });
  const [selectionAnchorIndex, setSelectionAnchorIndex] = React.useState<number | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<FileNode | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const {moveFilesBatch, uploadFile, deleteFiles, createDirectory} = useFileActions();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const isTrashView = currentPath === TRASH_PATH;

  const visibleFiles = React.useMemo(() => {
    if (!data?.items) return [];

    const now = Date.now();
    const filtered = data.items.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && !item.name.toLowerCase().includes(q)) return false;

      if (filterPreset === 'recent') {
        return now - new Date(item.lastModified).getTime() <= 1000 * 60 * 60 * 24 * 7;
      }
      if (filterPreset === 'large') {
        return item.type === 'FILE' && item.size >= 100 * 1024 * 1024;
      }
      if (filterPreset === 'media') {
        return /\.(jpg|jpeg|png|gif|webp|mp4|mov|mkv|mp3|wav)$/i.test(item.name);
      }
      if (filterPreset === 'documents') {
        return /\.(pdf|doc|docx|txt|md|xls|xlsx|ppt|pptx)$/i.test(item.name);
      }
      return true;
    });

    return sortFiles(filtered, sortMode);
  }, [data?.items, searchQuery, sortMode, filterPreset]);

  const handleSelectionIntent = (name: string, index: number, options: {shiftKey: boolean; toggleKey: boolean}) => {
    setFocusedFile(visibleFiles[index] ?? null);
    if (options.shiftKey && selectionAnchorIndex !== null) {
      const [start, end] = [selectionAnchorIndex, index].sort((a, b) => a - b);
      const next = new Set(selectedFiles);
      for (let i = start; i <= end; i++) {
        const target = visibleFiles[i];
        if (target) next.add(target.name);
      }
      handleSelectionChange(next);
      return;
    }

    if (options.toggleKey) {
      const next = new Set(selectedFiles);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      handleSelectionChange(next);
      setSelectionAnchorIndex(index);
      return;
    }

    handleSelectionChange(new Set([name]));
    setSelectionAnchorIndex(index);
  };

  const handleContextMenu = (event: React.MouseEvent, file: FileNode) => {
    setFocusedFile(file);
    setContextAnchor(event.currentTarget as HTMLElement);

    const next = new Set(selectedFiles);
    if (!next.has(file.name)) {
      next.add(file.name);
      handleSelectionChange(next);
    }
  };

  React.useEffect(() => {
    if (selectedFiles.size === 0) {
      setSelectionAnchorIndex(null);
    }
  }, [selectedFiles]);

  React.useEffect(() => {
    setPathInput(currentPath);
  }, [currentPath]);

  React.useEffect(() => {
    setTabs((prev) => prev.map((t) => t.id === activeTabId ? {...t, path: currentPath} : t));
  }, [activeTabId, currentPath]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (isTyping) return;

      if (event.key === 'Delete' && selectedFiles.size > 0) {
        event.preventDefault();
        void handleDeleteSelection();
      }

      if (event.key === 'F2' && focusedFile && selectedFiles.size <= 1) {
        event.preventDefault();
        setRenameTarget(focusedFile);
        setRenameValue(focusedFile.name);
      }

      if (event.key === 'Enter' && focusedFile?.type === 'DIRECTORY') {
        event.preventDefault();
        navigateTo(focusedFile.name);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c' && focusedFile) {
        event.preventDefault();
        void navigator.clipboard.writeText(focusedFile.name);
        showNotification('Copied selected name', 'success');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusedFile, selectedFiles, currentPath, isTrashView]);

  React.useEffect(() => {
    localStorage.setItem('fileBrowser.favorites', JSON.stringify(favorites));
  }, [favorites]);

  React.useEffect(() => {
    localStorage.setItem('fileBrowser.sortMode', sortMode);
  }, [sortMode]);

  React.useEffect(() => {
    localStorage.setItem('fileBrowser.filterPreset', filterPreset);
  }, [filterPreset]);

  React.useEffect(() => {
    setRecentPaths((prev) => {
      const next = [currentPath, ...prev.filter((p) => p !== currentPath)].slice(0, 8);
      localStorage.setItem('fileBrowser.recentPaths', JSON.stringify(next));
      return next;
    });
  }, [currentPath]);

  const navigateToPath = (path: string) => navigateTo(path);

  const openNewTab = () => {
    const nextId = `tab-${Date.now()}`;
    const nextPath = currentPath;
    setTabs((prev) => [...prev, {id: nextId, path: nextPath}]);
    setActiveTabId(nextId);
  };

  const switchTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    setActiveTabId(id);
    navigateToPath(tab.path);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeTabId === id) {
      setActiveTabId(next[0].id);
      navigateToPath(next[0].path);
    }
  };

  const toggleFavoritePath = () => {
    setFavorites((prev) => prev.includes(currentPath) ? prev.filter((p) => p !== currentPath) : [currentPath, ...prev]);
  };

  const closeContextMenu = () => setContextAnchor(null);

  const joinPath = (base: string, name: string) => {
    const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
    return `${normalizedBase}/${name}`;
  };

  const getFocusedPath = () => (focusedFile ? joinPath(currentPath, focusedFile.name) : null);

  const ensureTrashDirectory = async () => {
    try {
      await createDirectory({parentPath: '/', name: '.trash'});
    } catch {
      // noop
    }
  };

  const moveNamesToTrash = async (names: string[]) => {
    if (names.length === 0) return;
    await ensureTrashDirectory();
    await moveFilesBatch(names.map((name) => ({
      sourcePath: joinPath(currentPath, name),
      destinationPath: `${TRASH_PATH}/${name}`,
    })));
  };

  const restoreNamesFromTrash = async (names: string[]) => {
    if (names.length === 0) return;
    await moveFilesBatch(names.map((name) => ({
      sourcePath: `${TRASH_PATH}/${name}`,
      destinationPath: `/${name}`,
    })));
  };

  const handleDeleteFocused = async () => {
    const targetPath = getFocusedPath();
    if (!targetPath || !focusedFile) return;

    if (isTrashView) {
      await deleteFiles([targetPath]);
    } else {
      await moveNamesToTrash([focusedFile.name]);
    }

    setContextAnchor(null);
  };

  const handleDeleteSelection = async () => {
    const names = Array.from(selectedFiles);
    if (names.length === 0) return;

    if (isTrashView) {
      await deleteFiles(names.map((name) => `${TRASH_PATH}/${name}`));
    } else {
      await moveNamesToTrash(names);
    }

    clearSelection();
  };

  const handleShareFocused = async () => {
    const targetPath = getFocusedPath();
    if (!targetPath) return;
    await navigator.clipboard.writeText(targetPath);
    showNotification('Path copied for sharing', 'success');
    setContextAnchor(null);
  };

  const handleCopyName = async () => {
    if (!focusedFile) return;
    await navigator.clipboard.writeText(focusedFile.name);
    showNotification('Name copied', 'success');
    setContextAnchor(null);
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim() || renameValue.trim() === renameTarget.name) return;
    await fileApi.moveFile(joinPath(currentPath, renameTarget.name), joinPath(currentPath, renameValue.trim()));
    showNotification('Renamed successfully', 'success');
    setRenameTarget(null);
    setRenameValue('');
    await refetch();
  };

  const handleDropToDirectory = async (sourceNames: string[], targetDirectoryName: string) => {
    const uniqueNames = Array.from(new Set(sourceNames));
    if (uniqueNames.length === 0) return;
    setPendingMove({sourceNames: uniqueNames, targetDirectoryName});
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    const targetPath = joinPath(currentPath, pendingMove.targetDirectoryName);
    const targetListing = await fileApi.listFiles(targetPath);
    const existingNames = new Set(targetListing.items.map((item) => item.name));

    const conflicts = pendingMove.sourceNames.filter((name) => existingNames.has(name));
    const movable = pendingMove.sourceNames.filter((name) => !existingNames.has(name) && name !== pendingMove.targetDirectoryName);

    if (conflicts.length > 0) {
      showNotification(`Skipped ${conflicts.length} conflicting item(s)`, 'error');
    }

    if (movable.length === 0) {
      setPendingMove(null);
      setDraggingCount(0);
      clearSelection();
      return;
    }

    const moves = movable.map((name) => ({
      sourcePath: joinPath(currentPath, name),
      destinationPath: `${targetPath}/${name}`,
    }));

    await moveFilesBatch(moves);

    setPendingMove(null);
    setDraggingCount(0);
    clearSelection();
  };

  const handleDragOverBrowser = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    setIsDropzoneActive(true);
  };

  const handleDragLeaveBrowser = () => {
    setIsDropzoneActive(false);
  };

  const handleDropBrowser = async (event: React.DragEvent) => {
    if (!event.dataTransfer.files?.length) return;
    event.preventDefault();
    setIsDropzoneActive(false);
    setDraggingCount(0);

    const droppedFiles = Array.from(event.dataTransfer.files);
    for (const file of droppedFiles) {
      await uploadFile({file, directory: currentPath});
    }
  };

  return (
      <Box onDragOver={handleDragOverBrowser} onDragLeave={handleDragLeaveBrowser} onDrop={handleDropBrowser}>
        <Stack
            direction={{xs: 'column', sm: 'row'}}
            alignItems={{xs: 'stretch', sm: 'center'}}
            justifyContent="space-between"
            spacing={{xs: 2, sm: 0}}
            mb={2}
        >
          <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>
            Files
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center"
                 justifyContent={{xs: 'space-between', sm: 'flex-end'}}>
            <FileActionsToolbar
                selectedFiles={selectedFiles}
                currentPath={currentPath}
                onClearSelection={clearSelection}
                onRefresh={refetch}
            />

          <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={toggleViewMode}
              aria-label="view mode"
              size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon/>
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon/>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        </Stack>

        <Paper variant="outlined" sx={{mb: 2, p: 1}}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{overflowX: 'auto'}}>
            {tabs.map((tab, i) => (
              <Chip
                key={tab.id}
                label={`Tab ${i + 1}: ${tab.path}`}
                color={tab.id === activeTabId ? 'primary' : 'default'}
                onClick={() => switchTab(tab.id)}
                onDelete={tabs.length > 1 ? () => closeTab(tab.id) : undefined}
                variant={tab.id === activeTabId ? 'filled' : 'outlined'}
              />
            ))}
            <Button size="small" onClick={openNewTab}>+ New Tab</Button>
          </Stack>
        </Paper>

        {data && (
            <Box mb={2}>
              <Stack direction={{xs: 'column', md: 'row'}} spacing={1} sx={{mb: 1}}>
                <TextField
                  size="small"
                  label="Path"
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pathInput.trim()) navigateToPath(pathInput.trim());
                  }}
                  sx={{flex: 1}}
                />
                <FormControl size="small" sx={{minWidth: {xs: '100%', md: 220}}}>
                  <InputLabel id="recent-path-label">Recent</InputLabel>
                  <Select
                    labelId="recent-path-label"
                    label="Recent"
                    value=""
                    onChange={(e) => navigateToPath(e.target.value)}
                  >
                    {recentPaths.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
              <AppBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={navigateTo}/>
            </Box>
        )}

        {draggingCount > 0 && (
          <Alert severity="info" sx={{mb: 2}}>
            Dragging {draggingCount} item(s). Drop on a folder to move.
          </Alert>
        )}

        {data && (
          <Paper variant="outlined" sx={{mb: 2, p: 1.5}}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={3}>
              <Box sx={{minWidth: {md: 240}}}>
                <Typography variant="subtitle2" sx={{mb: 1}}>Favorites</Typography>
                <Stack spacing={0.5}>
                  {favorites.length === 0 ? <Typography variant="caption" color="text.secondary">No favorites yet</Typography> : favorites.map((p) => (
                    <Button key={p} size="small" variant="text" sx={{justifyContent: 'flex-start'}} onClick={() => navigateToPath(p)}>{p}</Button>
                  ))}
                </Stack>
              </Box>
              <Box sx={{minWidth: {md: 280}}}>
                <Typography variant="subtitle2" sx={{mb: 1}}>Recent paths</Typography>
                <Stack spacing={0.5}>
                  {recentPaths.map((p) => (
                    <Button key={p} size="small" variant="text" sx={{justifyContent: 'flex-start'}} onClick={() => navigateToPath(p)}>{p}</Button>
                  ))}
                </Stack>
              </Box>
              <Stack spacing={1} sx={{display: 'flex', alignItems: 'flex-start'}}>
                <Button size="small" variant={favorites.includes(currentPath) ? 'contained' : 'outlined'} onClick={toggleFavoritePath}>
                  {favorites.includes(currentPath) ? 'Unfavorite current path' : 'Favorite current path'}
                </Button>
                <Button size="small" variant={isTrashView ? 'contained' : 'outlined'} color={isTrashView ? 'warning' : 'inherit'} onClick={() => navigateToPath(TRASH_PATH)}>
                  Open Trash
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {isDropzoneActive && (
          <Alert severity="info" sx={{mb: 2}}>
            Drop files to upload into current folder.
          </Alert>
        )}

        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} mb={2} alignItems={{xs: 'stretch', md: 'center'}}>
          <TextField
            size="small"
            placeholder="Search files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{minWidth: {xs: '100%', md: 260}}}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{mr: 1, color: 'text.secondary'}}/>,
            }}
          />

          <FormControl size="small" sx={{minWidth: {xs: '100%', md: 180}}}>
            <InputLabel id="file-sort-label">Sort</InputLabel>
            <Select
              labelId="file-sort-label"
              value={sortMode}
              label="Sort"
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="date-desc">Date (Newest)</MenuItem>
              <MenuItem value="date-asc">Date (Oldest)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{minWidth: {xs: '100%', md: 190}}}>
            <InputLabel id="file-preset-label">Preset</InputLabel>
            <Select labelId="file-preset-label" value={filterPreset} label="Preset" onChange={(e) => setFilterPreset(e.target.value as FilterPreset)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="recent">Recent changes (7d)</MenuItem>
              <MenuItem value="large">Large files (&ge;100MB)</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
            </Select>
          </FormControl>

          <Chip
            color={selectedFiles.size > 0 ? 'primary' : 'default'}
            label={selectedFiles.size > 0 ? `Selected ${selectedFiles.size}` : `Total ${visibleFiles.length}`}
            variant={selectedFiles.size > 0 ? 'filled' : 'outlined'}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{mb: 2, overflowX: 'auto'}}>
          {([
            {key: 'recent', label: 'Recent (7d)'},
            {key: 'large', label: 'Large (≥100MB)'},
            {key: 'media', label: 'Media'},
            {key: 'documents', label: 'Documents'},
          ] as const).map((preset) => (
            <Chip
              key={preset.key}
              label={preset.label}
              clickable
              color={filterPreset === preset.key ? 'primary' : 'default'}
              variant={filterPreset === preset.key ? 'filled' : 'outlined'}
              onClick={() => setFilterPreset((prev) => (prev === preset.key ? 'all' : preset.key))}
            />
          ))}
          {filterPreset !== 'all' && (
            <Button size="small" onClick={() => setFilterPreset('all')}>Clear preset</Button>
          )}
        </Stack>

        {selectedFiles.size > 0 && (
          <Paper variant="outlined" sx={{mb: 2, p: 1.5, backgroundColor: 'primary.50'}}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1} alignItems={{xs: 'stretch', sm: 'center'}} justifyContent="space-between">
              <Typography variant="body2" sx={{fontWeight: 600}}>
                {selectedFiles.size} item(s) selected · Shift for range, Cmd/Ctrl for toggle · Delete/F2/Enter shortcuts enabled
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" onClick={() => handleSelectionChange(new Set(visibleFiles.map((f) => f.name)))}>Select All Visible</Button>
                {!isTrashView && <Button size="small" color="warning" onClick={() => void moveNamesToTrash(Array.from(selectedFiles))}>Move to Trash</Button>}
                {isTrashView && <Button size="small" color="success" onClick={() => void restoreNamesFromTrash(Array.from(selectedFiles))}>Restore</Button>}
                {isTrashView && <Button size="small" color="error" onClick={() => void deleteFiles(Array.from(selectedFiles).map((name) => `${TRASH_PATH}/${name}`))}>Delete Permanently</Button>}
                <Button size="small" onClick={clearSelection}>Clear</Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {isLoading && (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
              <CircularProgress/>
            </Box>
        )}

        {error && (
            <Alert
              severity="error"
              sx={{mb: 2}}
              action={<Button color="inherit" size="small" onClick={() => void refetch()}>Retry</Button>}
            >
              Failed to load files. Please check network/session and try again.
            </Alert>
        )}

        {data && visibleFiles.length === 0 && (
          <Paper variant="outlined" sx={{p: 4, mb: 2, textAlign: 'center'}}>
            <Typography variant="h6" sx={{mb: 1}}>{isTrashView ? 'Trash is empty' : 'This folder is empty'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
              {isTrashView ? 'Deleted items will appear here. Restore them anytime.' : 'Upload files or create a new folder to get started.'}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button variant="outlined" onClick={() => navigateTo('/')}>Go to root</Button>
              <Button variant="contained" onClick={() => void refetch()}>Refresh</Button>
            </Stack>
          </Paper>
        )}

        {data && visibleFiles.length > 0 && (
          <Stack direction={{xs: 'column', lg: 'row'}} spacing={2}>
            <Box sx={{flex: 1}}>
              <FileTable
                  files={visibleFiles}
                  onNavigate={navigateTo}
                  viewMode={viewMode}
                  selectedFiles={selectedFiles}
                  onSelectionChange={handleSelectionChange}
                  onSelectionIntent={handleSelectionIntent}
                  onContextMenu={handleContextMenu}
                  onDropToDirectory={(sourceNames, targetDirectoryName) => {
                    void handleDropToDirectory(sourceNames, targetDirectoryName);
                  }}
                  onDragSelectionCountChange={setDraggingCount}
              />
            </Box>

            <Paper variant="outlined" sx={{width: {xs: '100%', lg: 300}, p: 2, alignSelf: 'flex-start'}}>
              <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 1}}>Details</Typography>
              <Divider sx={{mb: 2}}/>
              {!focusedFile ? (
                <Typography variant="body2" color="text.secondary">Select or right-click a file to inspect details.</Typography>
              ) : (
                <Stack spacing={1.2}>
                  {focusedFile.type === 'FILE' && isPreviewableMedia(focusedFile.name) && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mb: 1}}>
                      <FileThumbnail name={focusedFile.name} path={focusedFile.path} size={180}/>
                    </Box>
                  )}
                  <Typography variant="body2"><strong>Name:</strong> {focusedFile.name}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {focusedFile.type}</Typography>
                  <Typography variant="body2"><strong>Size:</strong> {focusedFile.type === 'DIRECTORY' ? '--' : focusedFile.size}</Typography>
                  <Typography variant="body2"><strong>Modified:</strong> {focusedFile.lastModified}</Typography>
                  <Typography variant="body2"><strong>Owner:</strong> {focusedFile.owner}</Typography>
                  <Typography variant="body2"><strong>Path:</strong> {currentPath.endsWith('/') ? `${currentPath}${focusedFile.name}` : `${currentPath}/${focusedFile.name}`}</Typography>
                  <Stack direction="row" spacing={1} sx={{pt: 1}}>
                    <Button size="small" onClick={() => void handleShareFocused()}>Copy path</Button>
                    {focusedFile.type === 'DIRECTORY' && <Button size="small" onClick={() => navigateTo(focusedFile.name)}>Open</Button>}
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Stack>
        )}

        <Dialog open={Boolean(pendingMove)} onClose={() => { setPendingMove(null); setDraggingCount(0); }}>
          <DialogTitle>Confirm Move</DialogTitle>
          <DialogContent>
            Move {pendingMove?.sourceNames.length ?? 0} item(s) into folder
            {' '}
            <strong>{pendingMove?.targetDirectoryName}</strong>?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setPendingMove(null); setDraggingCount(0); }}>Cancel</Button>
            <Button variant="contained" onClick={() => void handleConfirmMove()}>Move</Button>
          </DialogActions>
        </Dialog>

        <Menu
          open={Boolean(contextAnchor)}
          anchorEl={contextAnchor}
          onClose={closeContextMenu}
        >
          <MenuItem
            disabled={focusedFile?.type !== 'DIRECTORY'}
            onClick={() => {
              if (focusedFile?.type === 'DIRECTORY') navigateTo(focusedFile.name);
              closeContextMenu();
            }}
          >Open</MenuItem>
          <MenuItem disabled={!focusedFile} onClick={() => { setIsMoveModalOpen(true); closeContextMenu(); }}>Move</MenuItem>
          <MenuItem disabled={!focusedFile} onClick={() => void handleCopyName()}>Copy</MenuItem>
          <MenuItem disabled={!focusedFile || selectedFiles.size > 1} onClick={() => {
            if (!focusedFile) return;
            setRenameTarget(focusedFile);
            setRenameValue(focusedFile.name);
            closeContextMenu();
          }}>Rename</MenuItem>
          <MenuItem disabled={!focusedFile} onClick={() => void handleDeleteFocused()}>{isTrashView ? 'Delete Permanently' : 'Move to Trash'}</MenuItem>
          <MenuItem
            disabled={!focusedFile || !isTrashView}
            onClick={() => {
              if (!focusedFile || !isTrashView) return;
              void restoreNamesFromTrash([focusedFile.name]);
              closeContextMenu();
            }}
          >Restore</MenuItem>
          <MenuItem disabled={!focusedFile} onClick={() => void handleShareFocused()}>Share</MenuItem>
        </Menu>

        <MoveFileModal
          open={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          selectedFiles={selectedFiles.size > 0 ? selectedFiles : new Set(focusedFile ? [focusedFile.name] : [])}
          sourceDirectory={currentPath}
          onSuccess={() => {
            clearSelection();
            setIsMoveModalOpen(false);
          }}
        />

        <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} fullWidth maxWidth="xs">
          <DialogTitle>Rename</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" fullWidth label="New name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => void handleRename()} disabled={!renameValue.trim()}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};
