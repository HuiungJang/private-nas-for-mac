import React from 'react';
import {
  Box,
  Checkbox,
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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type {FileNode} from '@/entities/file/model/types';
import {AppCard} from '@/shared/ui';
import {FileIcon} from '@/entities/file/ui/FileIcon';
import {FileThumbnail} from '@/entities/file/ui/FileThumbnail';
import {isPreviewableMedia} from '@/entities/file/ui/mediaPreview';

export type ViewMode = 'list' | 'grid';

interface FileTableProps {
  files: FileNode[];
  onNavigate: (name: string) => void;
  viewMode?: ViewMode;
  selectedFiles: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onContextMenu?: (event: React.MouseEvent, file: FileNode) => void;
  onDropToDirectory?: (sourceNames: string[], targetDirectoryName: string) => void;
  onDragSelectionCountChange?: (count: number) => void;
}

const StyledTableRow = styled(TableRow)(({theme}) => ({
  '&:last-child td, &:last-child th': {border: 0},
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}08 !important`,
  },
  '&.Mui-selected': {
    backgroundColor: `${theme.palette.primary.main}14 !important`,
  },
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: '16px',
  fontSize: '15px',
}));

const StyledHeaderCell = styled(TableCell)(({theme}) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#f8fafc',
  color: theme.palette.text.secondary,
  fontSize: '12px',
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: '0.4px',
  whiteSpace: 'nowrap',
}));

const GridItemCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({theme, selected}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  borderRadius: '12px',
  cursor: 'pointer',
  position: 'relative',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  transition: 'background-color 0.2s, border-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const formatSize = (size: number) => {
  if (size === 0) return '--';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileTable: React.FC<FileTableProps> = ({
                                                      files,
                                                      onNavigate,
                                                      viewMode = 'list',
                                                      selectedFiles,
                                                      onSelectionChange,
                                                      onContextMenu,
                                                      onDropToDirectory,
                                                      onDragSelectionCountChange,
                                                    }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dragOverDir, setDragOverDir] = React.useState<string | null>(null);

  const handleRowClick = (file: FileNode) => {
    if (file.type === 'DIRECTORY') {
      onNavigate(file.name);
    }
  };

  const handleSelect = (name: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    onSelectionChange(newSelected);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(new Set(files.map((f) => f.name)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const getDraggedNames = (file: FileNode): string[] => {
    if (selectedFiles.has(file.name) && selectedFiles.size > 0) {
      return Array.from(selectedFiles);
    }
    return [file.name];
  };

  const handleDragStart = (event: React.DragEvent, file: FileNode) => {
    const names = getDraggedNames(file);
    const payload = JSON.stringify(names);
    event.dataTransfer.setData('application/x-nas-file-names', payload);
    event.dataTransfer.effectAllowed = 'move';
    onDragSelectionCountChange?.(names.length);
  };

  const handleDragEnd = () => {
    setDragOverDir(null);
    onDragSelectionCountChange?.(0);
  };

  const handleDragOverDirectory = (event: React.DragEvent, directoryName: string) => {
    if (!onDropToDirectory) return;
    event.preventDefault();
    setDragOverDir(directoryName);
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDropDirectory = (event: React.DragEvent, directoryName: string) => {
    if (!onDropToDirectory) return;
    event.preventDefault();
    setDragOverDir(null);

    const raw = event.dataTransfer.getData('application/x-nas-file-names');
    if (!raw) return;

    try {
      const names = JSON.parse(raw) as string[];
      if (!Array.isArray(names) || names.length === 0) return;
      onDropToDirectory(names, directoryName);
    } catch {
      // ignore invalid payload
    }
  };

  // Mobile View: Always List (Simplified, selection via long press? Or just checkbox)
  if (isMobile) {
    return (
        <AppCard sx={{p: 0, overflow: 'hidden'}}>
          <List disablePadding>
            {files.map((file, index) => (
                <ListItem
                    key={file.name}
                    disablePadding
                    secondaryAction={
                      <Checkbox
                          edge="end"
                          checked={selectedFiles.has(file.name)}
                          onChange={() => handleSelect(file.name)}
                      />
                    }
                >
                  <ListItemButton
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)}
                      onDragLeave={() => setDragOverDir(null)}
                      onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                      onClick={() => handleRowClick(file)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onContextMenu?.(e, file);
                      }}
                      sx={{
                        borderBottom:
                            index !== files.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        py: 1.5,
                        backgroundColor: dragOverDir === file.name ? `${theme.palette.primary.main}22` : undefined,
                        outline: dragOverDir === file.name ? `2px dashed ${theme.palette.primary.main}` : undefined,
                      }}
                  >
                    <ListItemAvatar sx={{minWidth: 40, mr: 1}}>
                      {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                        <FileThumbnail name={file.name} path={file.path} size={28}/>
                      ) : (
                        <FileIcon name={file.name} type={file.type}/>
                      )}
                    </ListItemAvatar>
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
        </AppCard>
    );
  }

  // Desktop View: Grid
  if (viewMode === 'grid') {
    return (
        <Box sx={{p: 2}}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(6, 1fr)'
            },
            gap: 2
          }}>
            {files.map((file) => {
              const isSelected = selectedFiles.has(file.name);
              return (
                  <Box key={file.name}>
                    <GridItemCard
                        selected={isSelected}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)}
                        onDragLeave={() => setDragOverDir(null)}
                        onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                        onDoubleClick={() => handleRowClick(file)}
                        onClick={() => handleSelect(file.name)}
                        onContextMenu={(e: React.MouseEvent) => {
                          e.preventDefault();
                          onContextMenu?.(e, file);
                        }}
                        sx={dragOverDir === file.name ? {
                          outline: `2px dashed ${theme.palette.primary.main}`,
                          backgroundColor: `${theme.palette.primary.main}14`,
                          boxShadow: `0 0 0 2px ${theme.palette.primary.main}22 inset`
                        } : undefined}
                    >
                      <Box sx={{position: 'absolute', top: 8, left: 8}}>
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelect(file.name);
                            }}
                            size="small"
                        />
                      </Box>
                      {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                        <FileThumbnail name={file.name} path={file.path} size={64} sx={{mb: 1}}/>
                      ) : (
                        <FileIcon name={file.name} type={file.type} sx={{fontSize: 64, mb: 1}}/>
                      )}
                      <Typography
                          variant="body2"
                          align="center"
                          sx={{
                            fontWeight: 500,
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                      >
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.type === 'DIRECTORY' ? '' : formatSize(file.size)}
                      </Typography>
                    </GridItemCard>
                  </Box>
              );
            })}
          </Box>
        </Box>
    );
  }

  // Desktop View: Table (List)
  return (
      <TableContainer component={AppCard} sx={{overflow: 'hidden'}}>
        <Table sx={{minWidth: 650}} aria-label="file table">
          <TableHead>
            <TableRow>
              <StyledHeaderCell padding="checkbox">
                <Checkbox
                    indeterminate={selectedFiles.size > 0 && selectedFiles.size < files.length}
                    checked={files.length > 0 && selectedFiles.size === files.length}
                    onChange={handleSelectAll}
                />
              </StyledHeaderCell>
              <StyledHeaderCell width="50px"></StyledHeaderCell>
              <StyledHeaderCell>Name</StyledHeaderCell>
              <StyledHeaderCell align="right">Size</StyledHeaderCell>
              <StyledHeaderCell align="right">Date</StyledHeaderCell>
              <StyledHeaderCell align="right">Owner</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => {
              const isSelected = selectedFiles.has(file.name);
              return (
                  <StyledTableRow
                      key={file.name}
                      selected={isSelected}
                      draggable
                      onDragStart={(e) => handleDragStart(e, file)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)}
                      onDragLeave={() => setDragOverDir(null)}
                      onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                      onDoubleClick={() => handleRowClick(file)}
                      onClick={() => handleSelect(file.name)}
                      onContextMenu={(e: React.MouseEvent) => {
                        e.preventDefault();
                        onContextMenu?.(e, file);
                      }}
                      sx={dragOverDir === file.name ? {
                        outline: `2px dashed ${theme.palette.primary.main}`,
                        backgroundColor: `${theme.palette.primary.main}14`
                      } : undefined}
                  >
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelect(file.name);
                          }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                        <FileThumbnail name={file.name} path={file.path} size={28}/>
                      ) : (
                        <FileIcon name={file.name} type={file.type}/>
                      )}
                    </StyledTableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
  );
};

