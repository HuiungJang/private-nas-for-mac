import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useFiles} from './useFiles';
import {fileApi} from '../api/fileApi';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {DirectoryListing} from './types';

vi.mock('../api/fileApi');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({children}: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('fetches files for a given path', async () => {
    const mockData: DirectoryListing = {
      currentPath: '/root',
      breadcrumbs: [],
      items: [
        {name: 'file.txt', path: '/root/file.txt', type: 'FILE', size: 100, lastModified: '2023-01-01', owner: 'admin'},
      ],
    };

    vi.mocked(fileApi.listFiles).mockResolvedValue(mockData);

    const {result} = renderHook(() => useFiles('/root'), {wrapper});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(fileApi.listFiles).toHaveBeenCalledWith('/root');
  });
});
