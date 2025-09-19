import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VirtualMuseum from '../../pages/VirtualMuseum';

// Mock des données de collection
const mockCollection = [
  {
    id: '1',
    name: 'Test Art 1',
    description: 'Test description',
    type: 'nft',
    culture: 'Yoruba',
    country: 'Nigeria',
    tags: ['art', 'traditional'],
    image: 'https://example.com/image1.jpg'
  },
  {
    id: '2',
    name: 'Test Art 2',
    description: 'Test description 2',
    type: 'art',
    culture: 'Zulu',
    country: 'South Africa',
    tags: ['music', 'dance'],
    image: 'https://example.com/image2.jpg'
  }
];

const mockStats = {
  total: 2,
  nfts: 1,
  freeArts: 1,
  cultures: ['Yoruba', 'Zulu'],
  countries: ['Nigeria', 'South Africa']
};

// Mock de fetch
global.fetch = jest.fn();

describe('VirtualMuseum Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: { collection: mockCollection } })
    });

    render(<VirtualMuseum />);
    expect(screen.getByText('Chargement de la collection...')).toBeInTheDocument();
  });

  it('renders museum collection after loading', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { collection: mockCollection } })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { stats: mockStats } })
      });

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Musée Virtuel Africain')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Art 1')).toBeInTheDocument();
    expect(screen.getByText('Test Art 2')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { collection: mockCollection } })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { stats: mockStats } })
      });

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Musée Virtuel Africain')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Rechercher dans la collection...');
    fireEvent.change(searchInput, { target: { value: 'Test Art 1' } });

    expect(screen.getByText('Test Art 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Art 2')).not.toBeInTheDocument();
  });

  it('handles filter by type', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { collection: mockCollection } })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { stats: mockStats } })
      });

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Musée Virtuel Africain')).toBeInTheDocument();
    });

    // Ouvrir les filtres
    const filterButton = screen.getByText('Filtres');
    fireEvent.click(filterButton);

    // Filtrer par type NFT
    const typeSelect = screen.getByDisplayValue('Tous les types');
    fireEvent.change(typeSelect, { target: { value: 'nft' } });

    expect(screen.getByText('Test Art 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Art 2')).not.toBeInTheDocument();
  });

  it('handles view mode toggle', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { collection: mockCollection } })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { stats: mockStats } })
      });

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Musée Virtuel Africain')).toBeInTheDocument();
    });

    // Tester le toggle de vue
    const listViewButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listViewButton);

    // Vérifier que la classe de vue a changé
    const gallery = screen.getByRole('main').querySelector('.museum-gallery');
    expect(gallery).toHaveClass('list');
  });

  it('handles error state', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });

    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
  });

  it('handles empty collection', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { collection: [] } })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: { stats: { total: 0, nfts: 0, freeArts: 0, cultures: [], countries: [] } } })
      });

    render(<VirtualMuseum />);

    await waitFor(() => {
      expect(screen.getByText('Aucun objet trouvé')).toBeInTheDocument();
    });
  });
});
