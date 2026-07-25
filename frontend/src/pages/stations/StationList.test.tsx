import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StationList } from './StationList';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('StationList Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should render a list of stations fetched from the API', async () => {
    const mockStations = [
      { id: '1', name: 'Stasiun Alpha', location: 'Jakarta', firmwareVersion: '1.0.0' },
      { id: '2', name: 'Stasiun Beta', location: 'Bandung', firmwareVersion: '2.0.0' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStations,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <StationList />
      </QueryClientProvider>
    );

    // Menunggu data selesai di-fetch dan di-render
    await waitFor(() => {
      expect(screen.getByText('Stasiun Alpha')).toBeInTheDocument();
      expect(screen.getByText('Stasiun Beta')).toBeInTheDocument();
    });

    // Memastikan lokasi juga ditampilkan
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Bandung')).toBeInTheDocument();
  });

  it('should open the Add Station dialog when clicking the button', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <StationList />
      </QueryClientProvider>
    );

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Daftar Alat (Stations)')).toBeInTheDocument();
    });

    // Assume there is a button to add station. DialogTrigger might nest buttons, so we get all.
    const addButtons = screen.getAllByRole('button', { name: /tambah alat/i });
    expect(addButtons.length).toBeGreaterThan(0);
    
    // Simulate clicking the first button
    addButtons[0].click();

    // Verify the dialog opens by checking for its title
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tambah alat baru/i })).toBeInTheDocument();
    });
    
    // Test is currently going to fail here because the button does not exist yet
  });
});
