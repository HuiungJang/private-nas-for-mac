import {renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useFileTree} from './useFileTree';
import {fileApi} from '../api/fileApi';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';

// Mock API
vi.mock('../api/fileApi', () => ({
  fileApi: {
    listFiles: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: false},
  },
});

const wrapper = ({children}: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFileTree', () => {
  it('fetches files successfully', async () => {
    const mockData = {
      currentPath: '/root',
      breadcrumbs: [],
      items: [{name: 'file1.txt', type: 'FILE', size: 100, lastModified: '', owner: 'admin'}],
    };
    (fileApi.listFiles as any).mockResolvedValue(mockData);

    const {result} = renderHook(() => useFileTree('/root'), {wrapper});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(fileApi.listFiles).toHaveBeenCalledWith('/root');
  });
});
