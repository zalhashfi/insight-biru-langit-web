import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelemetryList } from './TelemetryList';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('TelemetryList Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should render a list of telemetry data fetched from the API', async () => {
    const mockTelemetry = [
      { id: '1', stationId: 's1', stationName: 'Stasiun Alpha', pm25: 15.5, temperature: 28.5, humidity: 65, timestamp: '2026-07-25T10:00:00Z' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTelemetry,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TelemetryList />
      </QueryClientProvider>
    );

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Data Sensor (Telemetry)')).toBeInTheDocument();
    });

    // Check if the data is rendered
    expect(screen.getByText('Stasiun Alpha')).toBeInTheDocument();
    expect(screen.getByText('15.5')).toBeInTheDocument();
    expect(screen.getByText('28.5')).toBeInTheDocument();
  });
});
