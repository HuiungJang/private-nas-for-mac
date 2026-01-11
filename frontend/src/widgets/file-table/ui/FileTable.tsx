import React from 'react';
import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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

export const FileTable: React.FC<FileTableProps> = ({files, onNavigate}) => {
  const handleRowDoubleClick = (file: FileNode) => {
    if (file.type === 'DIRECTORY') {
      onNavigate(file.name);
    }
  };

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
                <StyledTableRow key={file.name} onDoubleClick={() => handleRowDoubleClick(file)}>
                  <StyledTableCell>
                    {file.type === 'DIRECTORY' ? (
                        <FolderIcon sx={{color: '#0A84FF', fontSize: 28}}/>
                    ) : (
                        <InsertDriveFileIcon sx={{color: '#8E8E93', fontSize: 28}}/>
                    )}
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row" sx={{fontWeight: 500}}>
                    {file.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {file.type === 'DIRECTORY' ? '--' : (file.size / 1024).toFixed(1) + ' KB'}
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
