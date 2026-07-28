import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardHome } from './pages/DashboardHome';
import { StationList } from './pages/stations/StationList';
import { UnregisteredDevices } from './pages/stations/UnregisteredDevices';
import { TelemetryList } from './pages/telemetry/TelemetryList';
import { FirmwarePage } from './pages/firmware/FirmwarePage';
import { UserList } from './pages/users/UserList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/stations" element={<StationList />} />
                <Route path="/stations/unregistered" element={<UnregisteredDevices />} />
                <Route path="/telemetry" element={<TelemetryList />} />
                <Route path="/firmware" element={<FirmwarePage />} />
                <Route path="/users" element={<UserList />} />
              </Route>
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
