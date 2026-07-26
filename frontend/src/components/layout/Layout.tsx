import { Outlet, Link } from 'react-router';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <header role="banner" className="border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Insight Admin</h1>
          <nav className="flex space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
            <Link to="/stations" className="hover:text-black dark:hover:text-white transition-colors">Alat</Link>
            <Link to="/stations/unregistered" className="hover:text-black dark:hover:text-white transition-colors">Perlu Didaftarkan</Link>
            <Link to="/telemetry" className="hover:text-black dark:hover:text-white transition-colors">Data</Link>
            <Link to="/firmware" className="hover:text-black dark:hover:text-white transition-colors">Firmware</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
