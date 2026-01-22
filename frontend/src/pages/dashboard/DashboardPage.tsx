import {PageLayout} from '@/shared/ui/PageLayout';
import {FileBrowser} from '@/features/file-browser/ui/FileBrowser';
import {Box} from '@mui/material';

export const DashboardPage = () => {
  return (
      <PageLayout title="Dashboard">
        <Box sx={{p: 3}}>
          <FileBrowser/>
        </Box>
      </PageLayout>
  );
};

