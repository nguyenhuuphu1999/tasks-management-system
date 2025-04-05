
import '@testing-library/jest-dom';

// Make sure to properly extend the matchers
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add the custom matchers
expect.extend(matchers);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch if needed
global.fetch = vi.fn();

// Mock MutationObserver
class MockMutationObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

global.MutationObserver = MockMutationObserver as any;

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as any;
