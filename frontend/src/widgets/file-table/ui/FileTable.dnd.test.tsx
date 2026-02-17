import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {FileTable} from './FileTable';

const files = [
  {
    name: '사진',
    path: '/사진',
    type: 'DIRECTORY' as const,
    size: 0,
    lastModified: new Date().toISOString(),
    owner: 'system',
  },
  {
    name: '스크린샷.png',
    path: '/스크린샷.png',
    type: 'FILE' as const,
    size: 123,
    lastModified: new Date().toISOString(),
    owner: 'system',
  },
];

describe('FileTable drag and drop', () => {
  it('moves selected files when dropped on directory row', () => {
    // Force mobile list mode in test to avoid virtualized table behavior in jsdom.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(max-width:600px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    class IOStub {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }
    globalThis.IntersectionObserver = IOStub as unknown as typeof IntersectionObserver;

    const onDropToDirectory = vi.fn();

    render(
      <FileTable
        files={files}
        onNavigate={() => undefined}
        selectedFiles={new Set(['스크린샷.png'])}
        onSelectionChange={() => undefined}
        onDropToDirectory={onDropToDirectory}
      />
    );

    const sourceButton = screen.getByText('스크린샷.png').closest('div[role="button"]');
    const targetButton = screen.getByText('사진').closest('div[role="button"]');

    expect(sourceButton).toBeTruthy();
    expect(targetButton).toBeTruthy();

    const store: Record<string, string> = {};
    const dataTransfer = {
      setData: (key: string, value: string) => {
        store[key] = value;
      },
      getData: (key: string) => store[key] ?? '',
      effectAllowed: 'move',
      dropEffect: 'move',
      types: ['application/x-nas-file-names', 'text/plain'],
    } as unknown as DataTransfer;

    fireEvent.dragStart(sourceButton as Element, {dataTransfer});
    fireEvent.dragEnter(targetButton as Element, {dataTransfer});
    fireEvent.dragOver(targetButton as Element, {dataTransfer});
    fireEvent.drop(targetButton as Element, {dataTransfer});

    expect(onDropToDirectory).toHaveBeenCalledTimes(1);
    expect(onDropToDirectory).toHaveBeenCalledWith(['스크린샷.png'], '사진');
  });
});
