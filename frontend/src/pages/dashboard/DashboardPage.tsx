import {useState} from 'react';
import {PageLayout} from '@/shared/ui/PageLayout';
import {FileTable, type ViewMode} from '@/widgets/file-table/ui/FileTable';
import {useFiles} from '@/entities/file/model/useFiles';
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import {IOSBreadcrumbs} from '@/shared/ui/IOSBreadcrumbs';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';

export const DashboardPage = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const {data, isLoading, error} = useFiles(currentPath);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
      <PageLayout title="Dashboard">
        <Box sx={{p: 3}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" component="h1" sx={{fontWeight: 'bold'}}>
            Files
          </Typography>
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
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
                <IOSBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={handleNavigate}/>
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
                  onNavigate={handleNavigate}
                  viewMode={viewMode}
              />
          )}
        </Box>
      </PageLayout>
  );
};
