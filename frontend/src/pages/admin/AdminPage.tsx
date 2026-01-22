import {PageLayout} from '@/shared/ui/PageLayout';
import {AdminDashboard} from '@/features/admin-dashboard/ui/AdminDashboard';
import {Box, Typography} from '@mui/material';

export const AdminPage = () => {
  return (
      <PageLayout title="Administration">
        <Box sx={{p: 3}}>
          <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold', mb: 3}}>
            Administration
          </Typography>
          <AdminDashboard/>
        </Box>
      </PageLayout>
  );
};
