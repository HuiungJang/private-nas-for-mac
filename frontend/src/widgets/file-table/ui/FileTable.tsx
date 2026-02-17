import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { FileNode } from '@/entities/file/model/types';
import { AppCard } from '@/shared/ui';
import { FileIcon } from '@/entities/file/ui/FileIcon';
import { FileThumbnail } from '@/entities/file/ui/FileThumbnail';
import { isPreviewableMedia } from '@/entities/file/ui/mediaPreview';
import { formatExactDateTime, formatRelativeDateTime } from '@/shared/lib/datetime';

export type ViewMode = 'list' | 'grid';

interface FileTableProps {
  files: FileNode[];
  onNavigate: (name: string) => void;
  viewMode?: ViewMode;
  visibleColumns?: {
    size: boolean;
    date: boolean;
    owner: boolean;
  };
  selectedFiles: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onSelectionIntent?: (
    name: string,
    index: number,
    options: { shiftKey: boolean; toggleKey: boolean }
  ) => void;
  onContextMenu?: (event: React.MouseEvent, file: FileNode) => void;
  onDropToDirectory?: (sourceNames: string[], targetDirectoryName: string) => void;
  onDragSelectionCountChange?: (count: number) => void;
  onDragHoverDirectoryChange?: (directoryName: string | null) => void;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': { border: 0 },
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}10 !important`,
  },
  '&.Mui-selected': {
    backgroundColor: `${theme.palette.primary.main}18 !important`,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: '12px 16px',
  fontSize: '14px',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
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
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '14px',
  borderRadius: '12px',
  cursor: 'pointer',
  position: 'relative',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}10`,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}22 inset`,
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
  visibleColumns = { size: true, date: true, owner: true },
  selectedFiles,
  onSelectionChange,
  onSelectionIntent,
  onContextMenu,
  onDropToDirectory,
  onDragSelectionCountChange,
  onDragHoverDirectoryChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dragOverDir, setDragOverDir] = React.useState<string | null>(null);
  const updateDragOverDir = React.useCallback((name: string | null) => {
    setDragOverDir(name);
    onDragHoverDirectoryChange?.(name);
  }, [onDragHoverDirectoryChange]);
  const [gestureDragActive, setGestureDragActive] = React.useState(false);
  const [gestureDragSourceNames, setGestureDragSourceNames] = React.useState<string[] | null>(null);
  const [activeDragNames, setActiveDragNames] = React.useState<Set<string>>(new Set());
  const pointerCandidateRef = React.useRef<{x: number; y: number; file: FileNode} | null>(null);
  const INITIAL_RENDER_COUNT = 300;
  const RENDER_BATCH = 200;
  const [renderCount, setRenderCount] = React.useState(INITIAL_RENDER_COUNT);

  React.useEffect(() => {
    setRenderCount(INITIAL_RENDER_COUNT);
  }, [files.length, viewMode, isMobile]);

  const renderedFiles = files.slice(0, renderCount);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const tableVirtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 64,
    overscan: 8,
    enabled: !isMobile && viewMode === 'list',
  });

  const handleListScrollLoadMore = (event: React.UIEvent<HTMLElement>) => {
    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setRenderCount((prev) => Math.min(files.length, prev + RENDER_BATCH));
    }
  };

  const handleRowClick = (file: FileNode) => {
    if (file.type === 'DIRECTORY') {
      onNavigate(file.name);
    }
  };

  const handleSelect = (
    name: string,
    index: number,
    options: { shiftKey: boolean; toggleKey: boolean }
  ) => {
    if (onSelectionIntent) {
      onSelectionIntent(name, index, options);
      return;
    }

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
    // Fallback for browsers that do not preserve custom MIME types reliably.
    event.dataTransfer.setData('text/plain', payload);
    event.dataTransfer.effectAllowed = 'move';
    setActiveDragNames(new Set(names));
    onDragSelectionCountChange?.(names.length);
  };

  const handleDragEnd = () => {
    updateDragOverDir(null);
    setActiveDragNames(new Set());
    onDragSelectionCountChange?.(0);
  };

  const endGestureDrag = React.useCallback(() => {
    setGestureDragActive(false);
    setGestureDragSourceNames(null);
    setActiveDragNames(new Set());
    updateDragOverDir(null);
    onDragSelectionCountChange?.(0);
  }, [onDragSelectionCountChange, updateDragOverDir]);

  const beginPointerCandidate = (event: React.PointerEvent, file: FileNode) => {
    if (event.button !== 0 || file.type !== 'FILE') return;
    pointerCandidateRef.current = {x: event.clientX, y: event.clientY, file};
  };

  const maybeActivateGestureDrag = (event: React.PointerEvent) => {
    if (gestureDragActive) return;
    const c = pointerCandidateRef.current;
    if (!c) return;
    const dx = Math.abs(event.clientX - c.x);
    const dy = Math.abs(event.clientY - c.y);
    if (dx + dy < 8) return;
    const names = getDraggedNames(c.file);
    setGestureDragActive(true);
    setGestureDragSourceNames(names);
    setActiveDragNames(new Set(names));
    onDragSelectionCountChange?.(names.length);
  };

  React.useEffect(() => {
    const onPointerUp = () => {
      pointerCandidateRef.current = null;
      if (!gestureDragActive) return;
      if (!dragOverDir || !gestureDragSourceNames || !onDropToDirectory) {
        endGestureDrag();
        return;
      }
      Promise.resolve(onDropToDirectory(gestureDragSourceNames, dragOverDir)).finally(() => {
        endGestureDrag();
      });
    };
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [gestureDragActive, dragOverDir, gestureDragSourceNames, onDropToDirectory, endGestureDrag]);

  const maybeSetGestureTarget = (file: FileNode) => {
    if (!gestureDragActive || file.type !== 'DIRECTORY') return;
    updateDragOverDir(file.name);
  };

  const getDragProps = (file: FileNode) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, file),
    onDragEnd: handleDragEnd,
  });

  const handleDragOverDirectory = (event: React.DragEvent, directoryName: string) => {
    if (!onDropToDirectory) return;
    event.preventDefault();
    event.stopPropagation();
    updateDragOverDir(directoryName);
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterDirectory = (event: React.DragEvent, directoryName: string) => {
    if (!onDropToDirectory) return;
    event.preventDefault();
    event.stopPropagation();
    updateDragOverDir(directoryName);
  };

  const handleDropDirectory = (event: React.DragEvent, directoryName: string) => {
    if (!onDropToDirectory) return;
    event.preventDefault();
    event.stopPropagation();
    updateDragOverDir(null);

    const raw =
      event.dataTransfer.getData('application/x-nas-file-names') ||
      event.dataTransfer.getData('text/plain');
    if (!raw) return;

    try {
      const names = JSON.parse(raw) as string[];
      if (!Array.isArray(names) || names.length === 0) return;
      Promise.resolve(onDropToDirectory(names, directoryName)).catch(() => {
        // handled by caller notifications
      });
    } catch {
      // ignore invalid payload
    }
  };

  const dragTargetHighlightSx = {
    outline: `2px dashed ${theme.palette.primary.main}`,
    backgroundColor: `${theme.palette.primary.main}14`,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}22 inset`,
    transform: 'scale(1.01)',
    transformOrigin: 'center',
    transition: 'transform 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
    animation: 'dndPulseScale 900ms ease-in-out infinite',
    '@keyframes dndPulseScale': {
      '0%': {
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}22 inset`,
        transform: 'scale(1.005)',
      },
      '50%': {
        boxShadow: `0 0 0 5px ${theme.palette.primary.main}3d inset`,
        transform: 'scale(1.016)',
      },
      '100%': {
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}22 inset`,
        transform: 'scale(1.005)',
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: 'none',
    },
  };

  const getDraggingSourceSx = (name: string) =>
    activeDragNames.has(name)
      ? {
          opacity: 0.62,
          transform: 'scale(0.985)',
          boxShadow: `0 8px 20px ${theme.palette.common.black}22`,
          cursor: 'grabbing',
          transition: 'transform 100ms ease, opacity 100ms ease, box-shadow 100ms ease',
          filter: 'saturate(0.92)',
        }
      : undefined;


  // Mobile View: Always List (Simplified, selection via long press? Or just checkbox)
  if (isMobile) {
    return (
      <AppCard sx={{ p: 0, overflow: 'hidden' }}>
        <List
          disablePadding
          sx={{ maxHeight: '70vh', overflowY: 'auto' }}
          onScroll={handleListScrollLoadMore}
        >
          {renderedFiles.map((file, index) => (
            <ListItem
              key={file.name}
              disablePadding
              secondaryAction={
                <Checkbox
                  edge="end"
                  checked={selectedFiles.has(file.name)}
                  onChange={(e) => {
                    const native = e.nativeEvent as MouseEvent;
                    handleSelect(file.name, index, {
                      shiftKey: native.shiftKey,
                      // Checkbox click should always toggle multi-select without Cmd/Ctrl.
                      toggleKey: true,
                    });
                  }}
                />
              }
            >
              <ListItemButton
                {...getDragProps(file)}
                onDragEnter={(e) =>
                  file.type === 'DIRECTORY' && handleDragEnterDirectory(e, file.name)
                }
                onDragOver={(e) =>
                  file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)
                }
                onDragLeave={() => updateDragOverDir(null)}
                onDropCapture={(e) =>
                  file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)
                }
                onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                onPointerDown={(e) => beginPointerCandidate(e, file)}
                onPointerMove={maybeActivateGestureDrag}
                onPointerEnter={() => maybeSetGestureTarget(file)}
                onClick={() => handleRowClick(file)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu?.(e, file);
                }}
                sx={{
                  borderBottom:
                    index !== renderedFiles.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : 'none',
                  py: 1.5,
                  ...getDraggingSourceSx(file.name),
                  ...(dragOverDir === file.name ? dragTargetHighlightSx : {}),
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40, mr: 1 }}>
                  {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                    <FileThumbnail name={file.name} path={file.path} size={28} />
                  ) : (
                    <FileIcon name={file.name} type={file.type} />
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={file.name}
                  primaryTypographyProps={{ fontWeight: 500, noWrap: true }}
                  secondary={
                    file.type === 'DIRECTORY'
                      ? formatRelativeDateTime(file.lastModified)
                      : `${formatSize(file.size)} • ${formatRelativeDateTime(file.lastModified)}`
                  }
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
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
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(6, 1fr)',
            },
            gap: 2,
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
          onScroll={handleListScrollLoadMore}
        >
          {renderedFiles.map((file, index) => {
            const isSelected = selectedFiles.has(file.name);
            return (
              <Box key={file.name}>
                <GridItemCard
                  selected={isSelected}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) =>
                    file.type === 'DIRECTORY' && handleDragEnterDirectory(e, file.name)
                  }
                  onDragOver={(e) =>
                    file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)
                  }
                  onDragLeave={() => updateDragOverDir(null)}
                  onDropCapture={(e) =>
                    file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)
                  }
                  onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                  onPointerDown={(e) => beginPointerCandidate(e, file)}
                  onPointerMove={maybeActivateGestureDrag}
                  onPointerEnter={() => maybeSetGestureTarget(file)}
                  onDoubleClick={() => handleRowClick(file)}
                  onClick={(e) =>
                    handleSelect(file.name, index, {
                      shiftKey: e.shiftKey,
                      toggleKey: e.metaKey || e.ctrlKey,
                    })
                  }
                  onContextMenu={(e: React.MouseEvent) => {
                    e.preventDefault();
                    onContextMenu?.(e, file);
                  }}
                  sx={{
                    ...getDraggingSourceSx(file.name),
                    ...(dragOverDir === file.name ? dragTargetHighlightSx : {}),
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        const native = e.nativeEvent as MouseEvent;
                        handleSelect(file.name, index, {
                          shiftKey: native.shiftKey,
                          // Checkbox click should always toggle multi-select without Cmd/Ctrl.
                          toggleKey: true,
                        });
                      }}
                      size="small"
                    />
                  </Box>
                  {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                    <FileThumbnail name={file.name} path={file.path} size={64} sx={{ mb: 1 }} />
                  ) : (
                    <FileIcon name={file.name} type={file.type} sx={{ fontSize: 64, mb: 1 }} />
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
                  <Tooltip title={formatExactDateTime(file.lastModified)} arrow>
                    <Typography variant="caption" color="text.secondary">
                      {file.type === 'DIRECTORY'
                        ? formatRelativeDateTime(file.lastModified)
                        : `${formatSize(file.size)} • ${formatRelativeDateTime(file.lastModified)}`}
                    </Typography>
                  </Tooltip>
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
    <TableContainer
      ref={tableContainerRef}
      component={AppCard}
      sx={{ overflow: 'auto', maxHeight: '70vh' }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="file table">
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
            {visibleColumns.size && <StyledHeaderCell align="right">Size</StyledHeaderCell>}
            {visibleColumns.date && <StyledHeaderCell align="right">Date</StyledHeaderCell>}
            {visibleColumns.owner && <StyledHeaderCell align="right">Owner</StyledHeaderCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableVirtualizer.getVirtualItems().length > 0 && (
            <TableRow>
              <TableCell
                colSpan={3 + Number(visibleColumns.size) + Number(visibleColumns.date) + Number(visibleColumns.owner)}
                sx={{ height: tableVirtualizer.getVirtualItems()[0].start, p: 0, border: 0 }}
              />
            </TableRow>
          )}

          {tableVirtualizer.getVirtualItems().map((virtualRow) => {
            const file = files[virtualRow.index];
            const isSelected = selectedFiles.has(file.name);
            return (
              <StyledTableRow
                key={file.name}
                selected={isSelected}
                {...getDragProps(file)}
                onDragEnter={(e) =>
                  file.type === 'DIRECTORY' && handleDragEnterDirectory(e, file.name)
                }
                onDragOver={(e) =>
                  file.type === 'DIRECTORY' && handleDragOverDirectory(e, file.name)
                }
                onDragLeave={() => updateDragOverDir(null)}
                onDropCapture={(e) =>
                  file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)
                }
                onDrop={(e) => file.type === 'DIRECTORY' && handleDropDirectory(e, file.name)}
                onPointerDown={(e) => beginPointerCandidate(e, file)}
                onPointerMove={maybeActivateGestureDrag}
                onPointerEnter={() => maybeSetGestureTarget(file)}
                onDoubleClick={() => handleRowClick(file)}
                onClick={(e) =>
                  handleSelect(file.name, virtualRow.index, {
                    shiftKey: e.shiftKey,
                    toggleKey: e.metaKey || e.ctrlKey,
                  })
                }
                onContextMenu={(e: React.MouseEvent) => {
                  e.preventDefault();
                  onContextMenu?.(e, file);
                }}
                sx={{
                  ...getDraggingSourceSx(file.name),
                  ...(dragOverDir === file.name ? dragTargetHighlightSx : {}),
                }}
              >
                <StyledTableCell padding="checkbox" {...getDragProps(file)}>
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      const native = e.nativeEvent as MouseEvent;
                      handleSelect(file.name, virtualRow.index, {
                        shiftKey: native.shiftKey,
                        // Checkbox click should always toggle multi-select without Cmd/Ctrl.
                        toggleKey: true,
                      });
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell {...getDragProps(file)}>
                  {file.type === 'FILE' && isPreviewableMedia(file.name) ? (
                    <FileThumbnail name={file.name} path={file.path} size={28} />
                  ) : (
                    <FileIcon name={file.name} type={file.type} />
                  )}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" sx={{ fontWeight: 500 }} {...getDragProps(file)}>
                  {file.name}
                </StyledTableCell>
                {visibleColumns.size && (
                  <StyledTableCell align="right" {...getDragProps(file)}>
                    {file.type === 'DIRECTORY' ? '--' : formatSize(file.size)}
                  </StyledTableCell>
                )}
                {visibleColumns.date && (
                  <StyledTableCell align="right" {...getDragProps(file)}>
                    <Tooltip title={formatExactDateTime(file.lastModified)} arrow>
                      <span>{formatRelativeDateTime(file.lastModified)}</span>
                    </Tooltip>
                  </StyledTableCell>
                )}
                {visibleColumns.owner && (
                  <StyledTableCell align="right" sx={{ color: 'text.secondary' }} {...getDragProps(file)}>
                    {file.owner}
                  </StyledTableCell>
                )}
              </StyledTableRow>
            );
          })}

          {tableVirtualizer.getVirtualItems().length > 0 && (
            <TableRow>
              <TableCell
                colSpan={3 + Number(visibleColumns.size) + Number(visibleColumns.date) + Number(visibleColumns.owner)}
                sx={{
                  height:
                    tableVirtualizer.getTotalSize() -
                    tableVirtualizer.getVirtualItems()[
                      tableVirtualizer.getVirtualItems().length - 1
                    ].end,
                  p: 0,
                  border: 0,
                }}
              />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
