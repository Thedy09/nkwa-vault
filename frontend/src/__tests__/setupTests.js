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
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    nav: 'nav',
    main: 'main',
    footer: 'footer'
  },
  AnimatePresence: ({ children }) => children
}));

// Mock de Lucide React
jest.mock('lucide-react', () => ({
  Search: () => 'SearchIcon',
  Filter: () => 'FilterIcon',
  Grid: () => 'GridIcon',
  List: () => 'ListIcon',
  Upload: () => 'UploadIcon',
  Star: () => 'StarIcon',
  MapPin: () => 'MapPinIcon',
  Calendar: () => 'CalendarIcon',
  Tag: () => 'TagIcon',
  Eye: () => 'EyeIcon',
  Play: () => 'PlayIcon',
  Pause: () => 'PauseIcon',
  Home: () => 'HomeIcon',
  Music: () => 'MusicIcon',
  Menu: () => 'MenuIcon',
  X: () => 'XIcon',
  LogIn: () => 'LogInIcon',
  User: () => 'UserIcon',
  Users: () => 'UsersIcon',
  Brain: () => 'BrainIcon'
}));

// Mock des variables d'environnement
process.env.REACT_APP_API_URL = 'http://localhost:4000';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
