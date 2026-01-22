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
import {IOSButton, IOSCard} from '@/shared/ui';
import type {UserSummary} from '@/entities/user/model/types';
import AddIcon from '@mui/icons-material/Add';

interface UserTableProps {
  users: UserSummary[];
  onAddUser: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({users, onAddUser}) => {
  return (
      <IOSCard sx={{p: 0, overflow: 'hidden'}}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight={600}>Users</Typography>
          <IOSButton
              startIcon={<AddIcon/>}
              size="small"
              variant="contained"
              onClick={onAddUser}
          >
            Add User
          </IOSButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell component="th" scope="row" sx={{fontWeight: 500}}>
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {user.roles.map(role => (
                          <Chip key={role} label={role} size="small" sx={{mr: 0.5}}/>
                      ))}
                    </TableCell>
                    <TableCell align="right"
                               sx={{color: 'text.secondary', fontFamily: 'monospace'}}>
                      {user.id.split('-')[0]}...
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </IOSCard>
  );
};
