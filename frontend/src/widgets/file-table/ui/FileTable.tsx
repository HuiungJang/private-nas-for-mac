import React from 'react';
import {
  Paper,
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

interface FileTableProps {
  files: FileNode[];
  onNavigate: (name: string) => void;
}

export const FileTable: React.FC<FileTableProps> = ({files, onNavigate}) => {
  const handleRowDoubleClick = (file: FileNode) => {
    if (file.type === 'DIRECTORY') {
      onNavigate(file.name);
    }
  };

  return (
      <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="file table">
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Last Modified</TableCell>
              <TableCell align="right">Owner</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
                <TableRow
                    key={file.name}
                    sx={{'&:last-child td, &:last-child th': {border: 0}, cursor: 'pointer'}}
                    onDoubleClick={() => handleRowDoubleClick(file)}
                    hover
                >
                  <TableCell>
                    {file.type === 'DIRECTORY' ? (
                        <FolderIcon color="primary"/>
                    ) : (
                        <InsertDriveFileIcon color="action"/>
                    )}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {file.name}
                  </TableCell>
                  <TableCell align="right">{file.size}</TableCell>
                  <TableCell align="right">{file.lastModified}</TableCell>
                  <TableCell align="right">{file.owner}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
