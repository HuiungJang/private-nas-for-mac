import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type {FileNode} from '@/entities/file/model/types';
import {IOSCard} from '@/shared/ui';

interface FileTableProps {
  files: FileNode[];
  onNavigate: (name: string) => void;
}

const StyledTableRow = styled(TableRow)(() => ({
  '&:last-child td, &:last-child th': {border: 0},
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05) !important', // Subtle hover
  },
  '&:active': {
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important', // Press state
  },
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: '16px',
  fontSize: '15px',
}));

const StyledHeaderCell = styled(TableCell)(({theme}) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '13px',
  textTransform: 'uppercase',
  fontWeight: 600,
  letterSpacing: '0.5px',
}));

const formatSize = (size: number) => {
  if (size === 0) return '--';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileTable: React.FC<FileTableProps> = ({files, onNavigate}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRowClick = (file: FileNode) => {
    if (file.type === 'DIRECTORY') {
      onNavigate(file.name);
    }
  };

  const getIcon = (type: 'FILE' | 'DIRECTORY') => {
    return type === 'DIRECTORY' ? (
        <FolderIcon sx={{color: '#0A84FF', fontSize: 28}}/>
    ) : (
        <InsertDriveFileIcon sx={{color: '#8E8E93', fontSize: 28}}/>
    );
  };

  // Mobile View: List
  if (isMobile) {
    return (
        <IOSCard sx={{p: 0, overflow: 'hidden'}}>
          <List disablePadding>
            {files.map((file, index) => (
                <ListItem
                    key={file.name}
                    disablePadding
                    secondaryAction={
                      file.type === 'DIRECTORY' ? (
                          <NavigateNextIcon sx={{color: 'text.secondary', opacity: 0.5}}/>
                      ) : null
                    }
                >
                  <ListItemButton
                      onClick={() => handleRowClick(file)}
                      sx={{
                        borderBottom:
                            index !== files.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        py: 1.5,
                      }}
                  >
                    <ListItemAvatar sx={{minWidth: 40, mr: 1}}>{getIcon(file.type)}</ListItemAvatar>
                    <ListItemText
                        primary={file.name}
                        primaryTypographyProps={{fontWeight: 500, noWrap: true}}
                        secondary={
                          file.type === 'DIRECTORY'
                              ? file.lastModified.split('T')[0]
                              : `${formatSize(file.size)} • ${file.lastModified.split('T')[0]}`
                        }
                        secondaryTypographyProps={{variant: 'caption', color: 'text.secondary'}}
                    />
                  </ListItemButton>
                </ListItem>
            ))}
          </List>
        </IOSCard>
    );
  }

  // Desktop View: Table
  return (
      <TableContainer component={IOSCard} sx={{overflow: 'hidden'}}>
        <Table sx={{minWidth: 650}} aria-label="file table">
          <TableHead>
            <TableRow>
              <StyledHeaderCell width="50px"></StyledHeaderCell>
              <StyledHeaderCell>Name</StyledHeaderCell>
              <StyledHeaderCell align="right">Size</StyledHeaderCell>
              <StyledHeaderCell align="right">Date</StyledHeaderCell>
              <StyledHeaderCell align="right">Owner</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
                <StyledTableRow key={file.name} onDoubleClick={() => handleRowClick(file)}>
                  <StyledTableCell>{getIcon(file.type)}</StyledTableCell>
                  <StyledTableCell component="th" scope="row" sx={{fontWeight: 500}}>
                    {file.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {file.type === 'DIRECTORY' ? '--' : formatSize(file.size)}
                  </StyledTableCell>
                  <StyledTableCell align="right">{file.lastModified}</StyledTableCell>
                  <StyledTableCell align="right" sx={{color: 'text.secondary'}}>
                    {file.owner}
                  </StyledTableCell>
                </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
