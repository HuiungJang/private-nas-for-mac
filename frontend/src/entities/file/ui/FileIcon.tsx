import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import ArchiveIcon from '@mui/icons-material/Archive';
import type {SxProps, Theme} from '@mui/material';

interface FileIconProps {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  sx?: SxProps<Theme>;
}

export const FileIcon: React.FC<FileIconProps> = ({name, type, sx}) => {
  if (type === 'DIRECTORY') {
    return <FolderIcon sx={{color: '#0A84FF', fontSize: 28, ...sx}}/>;
  }

  const extension = name.split('.').pop()?.toLowerCase();

  let Icon = InsertDriveFileIcon;
  let color = '#8E8E93'; // Default Gray

  switch (extension) {
    case 'pdf':
      Icon = PictureAsPdfIcon;
      color = '#FF3B30'; // Red
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      Icon = ImageIcon;
      color = '#30B0C7'; // Cyan
      break;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      Icon = MovieIcon;
      color = '#AF52DE'; // Purple
      break;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'm4a':
      Icon = AudiotrackIcon;
      color = '#FF2D55'; // Pink
      break;
    case 'txt':
    case 'md':
    case 'doc':
    case 'docx':
      Icon = DescriptionIcon;
      color = '#8E8E93';
      break;
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
    case 'json':
    case 'java':
    case 'py':
      Icon = CodeIcon;
      color = '#FF9500'; // Orange
      break;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      Icon = ArchiveIcon;
      color = '#FFCC00'; // Yellow
      break;
    default:
      Icon = InsertDriveFileIcon;
      color = '#8E8E93';
  }

  return <Icon sx={{color, fontSize: 28, ...sx}}/>;
};
