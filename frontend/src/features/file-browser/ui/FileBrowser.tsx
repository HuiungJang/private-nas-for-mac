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
import {useFileActions} from '@/features/file-actions/model/useFileActions';
import {fileApi} from '@/entities/file/api/fileApi';
import {useNotificationStore} from '@/shared/model/useNotificationStore';
import type {FileNode} from '@/entities/file/model/types';

type SortMode = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

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
  const [sortMode, setSortMode] = React.useState<SortMode>('name-asc');
  const [focusedFile, setFocusedFile] = React.useState<FileNode | null>(null);
  const [contextAnchor, setContextAnchor] = React.useState<null | HTMLElement>(null);
  const [isDropzoneActive, setIsDropzoneActive] = React.useState(false);
  const [draggingCount, setDraggingCount] = React.useState(0);
  const [pendingMove, setPendingMove] = React.useState<{ sourceNames: string[]; targetDirectoryName: string } | null>(null);
  const {moveFilesBatch, uploadFile} = useFileActions();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const visibleFiles = React.useMemo(() => {
    if (!data?.items) return [];

    const filtered = data.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return sortFiles(filtered, sortMode);
  }, [data?.items, searchQuery, sortMode]);

  const handleContextMenu = (event: React.MouseEvent, file: FileNode) => {
    setFocusedFile(file);
    setContextAnchor(event.currentTarget as HTMLElement);

    const next = new Set(selectedFiles);
    if (!next.has(file.name)) {
      next.add(file.name);
      handleSelectionChange(next);
    }
  };

  const closeContextMenu = () => setContextAnchor(null);

  const joinPath = (base: string, name: string) => {
    const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
    return `${normalizedBase}/${name}`;
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

        {data && (
            <Box mb={2}>
              <AppBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={navigateTo}/>
            </Box>
        )}

        {draggingCount > 0 && (
          <Alert severity="info" sx={{mb: 2}}>
            Dragging {draggingCount} item(s). Drop on a folder to move.
          </Alert>
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

          <Chip
            color={selectedFiles.size > 0 ? 'primary' : 'default'}
            label={selectedFiles.size > 0 ? `Selected ${selectedFiles.size}` : `Total ${visibleFiles.length}`}
            variant={selectedFiles.size > 0 ? 'filled' : 'outlined'}
          />
        </Stack>

        {isLoading && (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
              <CircularProgress/>
            </Box>
        )}

        {error && (
            <Alert severity="error" sx={{mb: 2}}>
              Failed to load files
            </Alert>
        )}

        {data && (
          <Stack direction={{xs: 'column', lg: 'row'}} spacing={2}>
            <Box sx={{flex: 1}}>
              <FileTable
                  files={visibleFiles}
                  onNavigate={navigateTo}
                  viewMode={viewMode}
                  selectedFiles={selectedFiles}
                  onSelectionChange={handleSelectionChange}
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
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Name:</strong> {focusedFile.name}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {focusedFile.type}</Typography>
                  <Typography variant="body2"><strong>Size:</strong> {focusedFile.type === 'DIRECTORY' ? '--' : focusedFile.size}</Typography>
                  <Typography variant="body2"><strong>Modified:</strong> {focusedFile.lastModified}</Typography>
                  <Typography variant="body2"><strong>Owner:</strong> {focusedFile.owner}</Typography>
                  <Typography variant="body2"><strong>Path:</strong> {currentPath.endsWith('/') ? `${currentPath}${focusedFile.name}` : `${currentPath}/${focusedFile.name}`}</Typography>
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
            onClick={() => {
              if (focusedFile?.type === 'DIRECTORY') {
                navigateTo(focusedFile.name);
              }
              closeContextMenu();
            }}
          >
            Open
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (focusedFile) {
                const next = new Set(selectedFiles);
                if (next.has(focusedFile.name)) next.delete(focusedFile.name);
                else next.add(focusedFile.name);
                handleSelectionChange(next);
              }
              closeContextMenu();
            }}
          >
            Toggle Selection
          </MenuItem>
          <MenuItem onClick={closeContextMenu}>Show Details</MenuItem>
        </Menu>
      </Box>
  );
};
