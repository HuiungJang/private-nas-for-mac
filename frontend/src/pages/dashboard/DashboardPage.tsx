import React from 'react';
import {Alert, Box, CircularProgress, Typography} from '@mui/material';
import {useSearchParams} from 'react-router-dom';
import {IOSBreadcrumbs, IOSButton, IOSCard, PageLayout} from '@/shared/ui';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import {useAuthStore} from '@/entities/user/model/store';
import {useFileTree} from '@/entities/file/model/useFileTree';

export const DashboardPage: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get path from URL query param, default to '/' (root)
  // Note: Backend might expect empty string for root or specific root path.
  // Let's assume URL 'path' param maps directly to API 'path' param.
  const currentPath = searchParams.get('path') || '/';

  const {data, isLoading, error} = useFileTree(currentPath);

  const handleNavigate = (newPath: string) => {
    setSearchParams({path: newPath});
  };

  const handleFileClick = (name: string) => {
    // Construct new path.
    // If current is '/', result is '/name'.
    // If current is '/foo', result is '/foo/name'.
    const separator = currentPath === '/' ? '' : '/';
    handleNavigate(`${currentPath}${separator}${name}`);
  };

  return (
      <PageLayout
          title="My Files"
          actions={
            <IOSButton variant="text" onClick={logout}>
              Logout
            </IOSButton>
          }
      >
        <Box sx={{maxWidth: 1000, margin: '0 auto', pb: 4}}>
          {/* Header Section with Breadcrumbs & Actions */}
          <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Box sx={{flexGrow: 1, overflow: 'hidden'}}>
              {data?.breadcrumbs ? (
                  <IOSBreadcrumbs breadcrumbs={data.breadcrumbs} onNavigate={handleNavigate}/>
              ) : (
                  <Typography variant="h5" sx={{fontWeight: 600}}>
                    File Manager
                  </Typography>
              )}
            </Box>
            <IOSButton variant="tonal" sx={{ml: 2}}>
              Upload
            </IOSButton>
          </Box>

          {/* Content Area */}
          <Box sx={{minHeight: 400}}>
            {isLoading && (
                <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 400
                    }}
                >
                  <CircularProgress/>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                  Failed to load directory listing. {(error as any).message}
                </Alert>
            )}

            {!isLoading && !error && data && (
                <>
                  <FileTable files={data.items} onNavigate={handleFileClick}/>

                  {/* Empty State */}
                  {data.items.length === 0 && (
                      <Box sx={{textAlign: 'center', py: 8, color: 'text.secondary'}}>
                        <Typography variant="body1">This folder is empty.</Typography>
                      </Box>
                  )}
                </>
            )}
          </Box>

          {/* Footer / Stats */}
          <Box sx={{mt: 4}}>
            <IOSCard
                sx={{p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            >
              <Box>
                <Typography variant="h6" sx={{fontSize: 17, fontWeight: 600}}>
                Storage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                45.2 GB of 2 TB used
              </Typography>
              </Box>
              {/* Placeholder for a nice progress bar */}
              <Box
                  sx={{
                    width: 100,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#3A3A3C',
                    overflow: 'hidden',
                  }}
              >
                <Box sx={{width: '20%', height: '100%', bgcolor: '#0A84FF'}}/>
              </Box>
            </IOSCard>
          </Box>
        </Box>
      </PageLayout>
  );
};
