// Configuration pour les tests React
import '@testing-library/jest-dom';

// Mock des modules externes
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock de Framer Motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const motionProxy = new Proxy(
    {},
    {
      get: (_target, prop) => {
        return React.forwardRef(({ children, ...props }, ref) =>
          React.createElement(prop, { ...props, ref }, children)
        );
      }
    }
  );

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }) => children
  };
});

// Mock de Lucide React
jest.mock('lucide-react', () => {
  const React = require('react');
  const icon = (name) => () => React.createElement('span', { 'data-icon': name });

  return new Proxy(
    {},
    {
      get: (_target, prop) => icon(String(prop))
    }
  );
});

// Mock des variables d'environnement
process.env.REACT_APP_API_URL = 'http://localhost:4000';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
