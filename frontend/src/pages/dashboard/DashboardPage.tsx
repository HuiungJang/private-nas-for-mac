import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {IOSButton, IOSCard, PageLayout} from '@/shared/ui';
import {FileTable} from '@/widgets/file-table/ui/FileTable';
import type {FileNode} from '@/entities/file/model/types';
import {useAuthStore} from '@/entities/user/model/store';

// Mock Data for visualization
const MOCK_FILES: FileNode[] = [
  {name: 'Documents', type: 'DIRECTORY', size: 0, lastModified: '2023-10-27', owner: 'admin'},
  {name: 'Photos', type: 'DIRECTORY', size: 0, lastModified: '2023-10-26', owner: 'admin'},
  {
    name: 'Project_Alpha_Specs.pdf',
    type: 'FILE',
    size: 2048576,
    lastModified: '2023-10-25',
    owner: 'admin',
  },
  {
    name: 'budget_2024.xlsx',
    type: 'FILE',
    size: 10240,
    lastModified: '2023-10-24',
    owner: 'admin',
  },
];

export const DashboardPage: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const [currentPath, setCurrentPath] = useState('/root');

  return (
      <PageLayout
          title="My Files"
          actions={
            <IOSButton variant="text" onClick={logout}>
              Logout
            </IOSButton>
          }
      >
        <Box sx={{maxWidth: 1000, margin: '0 auto'}}>
          <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h5" sx={{fontWeight: 600, px: 1}}>
              {currentPath}
            </Typography>
            <IOSButton variant="tonal">Upload</IOSButton>
          </Box>

          <FileTable
              files={MOCK_FILES}
              onNavigate={(name) => setCurrentPath(`${currentPath}/${name}`)}
          />

          <Box sx={{mt: 4, px: 1}}>
            <IOSCard sx={{p: 2}}>
              <Typography variant="h6" sx={{mb: 1}}>
                Storage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                45.2 GB of 2 TB used
              </Typography>
              {/* Visual progress bar could go here */}
            </IOSCard>
          </Box>
        </Box>
      </PageLayout>
  );
};
