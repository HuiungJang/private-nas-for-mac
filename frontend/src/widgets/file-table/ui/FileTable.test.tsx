import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileTable} from './FileTable';
import type {FileNode} from '@/entities/file/model/types';

describe('FileTable', () => {
  const mockFiles: FileNode[] = [
    {name: 'folder1', type: 'DIRECTORY', size: 0, lastModified: '2023-01-01', owner: 'admin'},
    {name: 'file1.txt', type: 'FILE', size: 1024, lastModified: '2023-01-02', owner: 'admin'},
  ];

  const onNavigate = vi.fn();
  const onSelectionChange = vi.fn();
  const selectedFiles = new Set<string>();

  beforeEach(() => {
    onNavigate.mockClear();
    onSelectionChange.mockClear();
  });

  it('renders file list correctly', () => {
    render(<FileTable
        files={mockFiles}
        onNavigate={onNavigate}
        selectedFiles={selectedFiles}
        onSelectionChange={onSelectionChange}
    />);

    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('1024')).toBeInTheDocument(); // Size
  });

  it('calls onNavigate when directory is clicked', () => {
    render(<FileTable
        files={mockFiles}
        onNavigate={onNavigate}
        selectedFiles={selectedFiles}
        onSelectionChange={onSelectionChange}
    />);

    fireEvent.doubleClick(screen.getByText('folder1')); // Assuming double click navigation
    expect(onNavigate).toHaveBeenCalledWith('folder1');
  });

  it('does not call onNavigate when file is clicked', () => {
    render(<FileTable
        files={mockFiles}
        onNavigate={onNavigate}
        selectedFiles={selectedFiles}
        onSelectionChange={onSelectionChange}
    />);

    fireEvent.doubleClick(screen.getByText('file1.txt'));
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
