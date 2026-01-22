import {useState} from 'react';
import {PageLayout} from '@/shared/ui/PageLayout';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import {useFiles} from '@/entities/file/model/useFiles';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';

export const DashboardPage = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const {data, isLoading, error} = useFiles(currentPath);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  return (
      <PageLayout>
        <Box sx={{p: 3}}>
          <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
            Files
          </Typography>

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
                  data={data}
                  onNavigate={handleNavigate}
              />
          )}
        </Box>
      </PageLayout>
  );
};
