import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';

describe('Layout Component', () => {
  it('should render the navigation header and the child route content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div data-testid="page-content">Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Verifikasi navbar/header dirender
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header/Banner
    expect(screen.getByText('Insight Admin')).toBeInTheDocument(); // Title

    // Verifikasi konten halaman (Outlet) dirender
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });
});
