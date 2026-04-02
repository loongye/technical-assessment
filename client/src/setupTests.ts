import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Handle missing globals in some JSDOM environments
const xhrMock = vi.fn().mockImplementation(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
  upload: { addEventListener: vi.fn() },
  addEventListener: vi.fn(),
}));

if (typeof globalThis !== 'undefined') {
  (globalThis as any).XMLHttpRequest = xhrMock;
  (globalThis as any).FormData = (globalThis as any).FormData || vi.fn().mockImplementation(() => ({
    append: vi.fn(),
  }));
  (globalThis as any).File = (globalThis as any).File || vi.fn().mockImplementation((content, name, options) => ({
    content, name, options
  }));
}
