import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirmwarePage } from './FirmwarePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('FirmwarePage', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should render the firmware form and list', async () => {
    const mockFirmware = [
      { id: '1', version: '2.0.0', url: 'https://example.com/fw2.bin', releaseNotes: 'Bug fixes', createdAt: '2026-07-25T10:00:00Z' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFirmware,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FirmwarePage />
      </QueryClientProvider>
    );

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Manajemen Firmware')).toBeInTheDocument();
    });

    // Check if the form is present
    expect(screen.getByLabelText(/Versi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Link Firmware/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tambah Firmware/i })).toBeInTheDocument();

    // Check if the data is rendered in the list
    await waitFor(() => {
      expect(screen.getByText('2.0.0')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/fw2.bin')).toBeInTheDocument();
    });
  });
});
