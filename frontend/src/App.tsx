import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { StationList } from './pages/stations/StationList';
import { TelemetryList } from './pages/telemetry/TelemetryList';
import { FirmwarePage } from './pages/firmware/FirmwarePage';

// Inisialisasi React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div className="p-4">Dashboard Home</div>} />
            <Route path="/stations" element={<div className="p-4"><StationList /></div>} />
            <Route path="/telemetry" element={<div className="p-4"><TelemetryList /></div>} />
            <Route path="/firmware" element={<div className="p-4"><FirmwarePage /></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
