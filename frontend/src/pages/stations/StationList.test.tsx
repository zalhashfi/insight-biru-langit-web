import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
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
      { uuid: '1', name: 'Stasiun Alpha', projectName: 'Biru Langit', type: 'aqms', macAddress: '00:11:22', currentVersion: '1.0.0', latitude: null, longitude: null },
      { uuid: '2', name: 'Stasiun Beta', projectName: 'Biru Langit 2', type: 'soc', macAddress: null, currentVersion: '2.0.0', latitude: -7.0, longitude: 110.0 },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stations: mockStations }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StationList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Menunggu data selesai di-fetch dan di-render
    await waitFor(() => {
      expect(screen.getByText('Stasiun Alpha')).toBeInTheDocument();
      expect(screen.getByText('Stasiun Beta')).toBeInTheDocument();
    });

    // Memastikan lokasi juga ditampilkan
    expect(screen.getByText('Biru Langit')).toBeInTheDocument();
    expect(screen.getByText('Biru Langit 2')).toBeInTheDocument();
  });

  it('should open the Add Station dialog when clicking the button', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stations: [] }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StationList />
        </BrowserRouter>
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
