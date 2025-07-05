// Test setup file for Jest (TypeScript)
import type { Mock } from 'jest-mock';

declare global {
  // Augment NodeJS global with browser-like properties
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigator: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document: any;
      console: Console & { warn: Mock; error: Mock };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  vendor: 'Google Inc.',
  maxTouchPoints: 0
} as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  chrome: {
    runtime: {
      onConnect: true
    },
    webstore: true
  }
} as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.document = {
  documentMode: undefined,
  createElement: () => ({
    style: {},
    parentNode: {
      removeChild: jest.fn()
    }
  }) as any,
  body: {
    appendChild: jest.fn()
  } as any
} as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
} as any; 