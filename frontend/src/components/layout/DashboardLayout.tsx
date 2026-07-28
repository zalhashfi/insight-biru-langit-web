import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Radio,
  AlertCircle,
  Activity,
  HardDrive,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'engineer', 'user'] },
    { to: '/stations', label: 'Alat', icon: Radio, roles: ['admin', 'engineer'] },
    { to: '/stations/unregistered', label: 'Perlu Didaftarkan', icon: AlertCircle, roles: ['admin', 'engineer'] },
    { to: '/telemetry', label: 'Data Sensor', icon: Activity, roles: ['admin', 'engineer', 'user'] },
    { to: '/firmware', label: 'Firmware', icon: HardDrive, roles: ['admin', 'engineer'] },
    { to: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
  ];

  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-border">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        {!isCollapsed && <span className="text-lg font-bold tracking-tight text-primary">Insight</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto hidden md:flex" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-border">
        {user && (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-4`}>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user.fullName}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs py-0">
                    {user.role}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
        <Button 
          variant="destructive" 
          className={`w-full ${isCollapsed ? 'px-2' : ''}`}
          onClick={() => logout()}
        >
          <LogOut size={18} className={isCollapsed ? '' : 'mr-2'} />
          {!isCollapsed && 'Keluar'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out md:relative md:flex ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-[80px]' : 'w-64'}`}
      >
        <div className="w-full h-full">
          <NavContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex items-center px-4 border-b border-border md:hidden shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="mr-2">
            <Menu size={20} />
          </Button>
          <span className="text-lg font-bold text-primary tracking-tight">Insight</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
