import React from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import {IOSBreadcrumbs} from '@/shared/ui/IOSBreadcrumbs';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import {useFileBrowser} from '../model/useFileBrowser';

export const FileBrowser: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    viewMode,
    navigateTo,
    toggleViewMode,
  } = useFileBrowser();

  return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>
            Files
          </Typography>
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

        {data && (
            <Box mb={2}>
              <IOSBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={navigateTo}/>
            </Box>
        )}

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
                files={data.items}
                onNavigate={navigateTo}
                viewMode={viewMode}
            />
        )}
      </Box>
  );
};
