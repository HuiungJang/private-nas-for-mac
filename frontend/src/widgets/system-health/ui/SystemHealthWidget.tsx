import React from 'react';
import {Box, CircularProgress, Stack, Typography} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import InsightsIcon from '@mui/icons-material/Insights';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {AppCard} from '@/shared/ui';
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
    <AppCard sx={{p: 3, height: '100%'}}>
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
    </AppCard>
);

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({data, isLoading}) => {
  const [previewTrend, setPreviewTrend] = React.useState<number[]>([]);
  const [auditTrend, setAuditTrend] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!data) return;

    setPreviewTrend((prev) => [...prev, data.previewCacheHitRatio * 100].slice(-24));
    if (data.auditLogsQueryP95Ms >= 0) {
      setAuditTrend((prev) => [...prev, data.auditLogsQueryP95Ms].slice(-24));
    }
  }, [data]);

  const toSparkline = (values: number[]) => {
    if (values.length === 0) return '-';
    const bars = '▁▂▃▄▅▆▇█';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1e-9, max - min);
    return values
      .map((v) => {
        const idx = Math.min(bars.length - 1, Math.floor(((v - min) / range) * (bars.length - 1)));
        return bars[idx];
      })
      .join('');
  };

  if (isLoading || !data) {
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
          <CircularProgress/>
        </Box>
    );
  }

  const memoryPercent = ((data.memoryUsed / data.memoryTotal) * 100).toFixed(1);
  const storagePercent = ((data.storageUsed / data.storageTotal) * 100).toFixed(1);
  const previewHitRatioPercent = (data.previewCacheHitRatio * 100).toFixed(1);

  const previewTrendText = toSparkline(previewTrend);
  const auditTrendText = toSparkline(auditTrend);

  return (
      <Stack direction={{xs: 'column', md: 'row'}} spacing={3} flexWrap="wrap" useFlexGap>
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
        <Box flex={1} minWidth={{md: 260}}>
          <StatCard
              title="Storage"
              value={formatBytes(data.storageUsed)}
              subValue={`${storagePercent}% of ${formatBytes(data.storageTotal)}`}
              icon={<StorageIcon color="success"/>}
          />
        </Box>

        <Box flex={1} minWidth={{md: 260}}>
          <StatCard
              title="Preview Cache"
              value={`${previewHitRatioPercent}% hit`}
              subValue={`hit ${data.previewCacheHit.toFixed(0)} / miss ${data.previewCacheMiss.toFixed(0)} • ${previewTrendText}`}
              icon={<InsightsIcon color="info"/>}
          />
        </Box>

        <Box flex={1} minWidth={{md: 260}}>
          <StatCard
              title="Audit Query P95"
              value={data.auditLogsQueryP95Ms >= 0 ? `${data.auditLogsQueryP95Ms.toFixed(1)} ms` : 'N/A'}
              subValue={`/api/admin/system/audit-logs latency • ${auditTrendText}`}
              icon={<QueryStatsIcon color="warning"/>}
          />
        </Box>
      </Stack>
  );
};
