import React from 'react';
import {Box, CircularProgress, Stack, Typography} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import {IOSCard} from '@/shared/ui';
import type {SystemHealth} from '@/entities/system/model/types';

interface SystemHealthWidgetProps {
  data?: SystemHealth;
  isLoading: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StatCard = ({title, value, icon, subValue}: {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode
}) => (
    <IOSCard sx={{p: 3, height: '100%'}}>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
        <Box sx={{
          p: 1,
          borderRadius: '12px',
          bgcolor: 'action.hover',
          mr: 2,
          display: 'flex'
        }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{mb: 0.5}}>
        {value}
      </Typography>
      {subValue && (
          <Typography variant="body2" color="text.secondary">
            {subValue}
          </Typography>
      )}
    </IOSCard>
);

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({data, isLoading}) => {
  if (isLoading || !data) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
          <CircularProgress/>
        </Box>
    );
  }

  const memoryPercent = ((data.memoryUsed / data.memoryTotal) * 100).toFixed(1);
  const storagePercent = ((data.storageUsed / data.storageTotal) * 100).toFixed(1);

  return (
      <Stack direction={{xs: 'column', md: 'row'}} spacing={3}>
        <Box flex={1}>
          <StatCard
              title="CPU Usage"
              value={`${(data.cpuUsage * 100).toFixed(1)}%`}
              icon={<SpeedIcon color="primary"/>}
          />
        </Box>
        <Box flex={1}>
          <StatCard
              title="Memory"
              value={formatBytes(data.memoryUsed)}
              subValue={`${memoryPercent}% of ${formatBytes(data.memoryTotal)}`}
              icon={<MemoryIcon color="secondary"/>}
          />
        </Box>
        <Box flex={1}>
          <StatCard
              title="Storage"
              value={formatBytes(data.storageUsed)}
              subValue={`${storagePercent}% of ${formatBytes(data.storageTotal)}`}
              icon={<StorageIcon color="success"/>}
          />
        </Box>
      </Stack>
  );
};
