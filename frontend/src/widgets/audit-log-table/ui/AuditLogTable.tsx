import React from 'react';
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {IOSCard} from '@/shared/ui';
import type {AuditLog} from '@/entities/audit/model/types';

interface AuditLogTableProps {
  logs: AuditLog[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
      return 'error';
    default:
      return 'default';
  }
};

export const AuditLogTable: React.FC<AuditLogTableProps> = ({logs}) => {
  return (
      <IOSCard sx={{p: 0, overflow: 'hidden'}}>
        <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
          <Typography variant="h6" fontWeight={600}>Audit Logs</Typography>
        </Box>
        <TableContainer sx={{maxHeight: 600}}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{color: 'text.secondary', fontSize: '0.875rem'}}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{fontWeight: 500}}>{log.action}</TableCell>
                    <TableCell sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}>{log.targetResource}</TableCell>
                    <TableCell sx={{fontFamily: 'monospace', fontSize: '0.85rem'}}>
                      {log.userId.split('-')[0]}...
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <Chip
                          label={log.status}
                          size="small"
                          color={getStatusColor(log.status) as any}
                          variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </IOSCard>
  );
};
