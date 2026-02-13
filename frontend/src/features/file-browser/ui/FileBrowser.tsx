import React from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
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
import {IOSBreadcrumbs} from '@/shared/ui/IOSBreadcrumbs';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import {useFileBrowser} from '../model/useFileBrowser';
import {FileActionsToolbar} from '@/features/file-actions/ui/FileActionsToolbar';
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

  const visibleFiles = React.useMemo(() => {
    if (!data?.items) return [];

    const filtered = data.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return sortFiles(filtered, sortMode);
  }, [data?.items, searchQuery, sortMode]);

  return (
      <Box>
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
              <IOSBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={navigateTo}/>
            </Box>
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
            <FileTable
                files={visibleFiles}
                onNavigate={navigateTo}
                viewMode={viewMode}
                selectedFiles={selectedFiles}
                onSelectionChange={handleSelectionChange}
            />
        )}
      </Box>
  );
};
