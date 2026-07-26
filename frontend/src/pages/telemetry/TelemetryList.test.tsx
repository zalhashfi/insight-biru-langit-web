import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelemetryList } from './TelemetryList';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('TelemetryList Page', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
    global.fetch = vi.fn();

    // mock ResizeObserver for recharts
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('should render a prompt to select a station initially', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stations: [] }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TelemetryList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pilih Stasiun/i)).toBeInTheDocument();
    });
  });

  it('should render a list of telemetry data fetched from the API after selecting a station', async () => {
    const mockStations = [{ id: '1', uuid: 's1', name: 'Stasiun Alpha', type: 'aqms' }];
    const mockTelemetry = [
      { id: '1', stationId: 's1', stationName: 'Stasiun Alpha', pm25: 15.5, temperature: 28.5, humidity: 65, timestamp: '2026-07-25T10:00:00Z' },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stations: mockStations }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: 'aqms', data: mockTelemetry }),
      });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TelemetryList />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    const dropdown = await screen.findByRole('combobox');
    await user.click(dropdown);
    
    // Select component opens a portal which is at the end of the document
    const option = await screen.findByRole('option', { name: /Stasiun Alpha/i });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByText('Data Sensor (Telemetry)')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Stasiun Alpha/).length).toBeGreaterThan(0);
    expect(screen.getByText('15.5')).toBeInTheDocument();
    expect(screen.getByText('28.5')).toBeInTheDocument();
  });
});
