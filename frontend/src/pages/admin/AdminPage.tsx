import {AdminDashboard} from '@/features/admin-dashboard/ui/AdminDashboard';
import {Typography} from '@mui/material';

export const AdminPage = () => {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold', mb: 3}}>
        Administration
      </Typography>
      <AdminDashboard/>
    </>
  );
};
