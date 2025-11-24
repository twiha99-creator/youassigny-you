import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { LogoIcon, RefereeBackground } from './Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, notifications } = useApp();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          active ? 'bg-gold-400 text-navy-900 font-bold' : 'text-gray-300 hover:bg-navy-800 hover:text-white'
        }`}
      >
        <i className={`fas ${icon} w-6 text-center`}></i>
        <span>{label}</span>
      </Link>
    );
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="relative bg-navy-900 w-full md:w-64 flex-shrink-0 flex flex-col text-white shadow-xl z-20 overflow-hidden">
        {/* Rich Referee Background Pattern (Dark Theme) */}
        <RefereeBackground theme="dark" opacity="opacity-5" className="z-0" />

        <div className="relative z-10 p-6 flex items-center space-x-3 border-b border-navy-800">
          <div className="flex-shrink-0">
             <LogoIcon className="w-10 h-10" />
          </div>
          <span className="text-lg font-bold tracking-wide text-gold-400 leading-tight">YOU ASSIGN</span>
        </div>

        <nav className="relative z-10 flex-1 p-4 space-y-2">
          <NavItem to="/" icon="fa-chart-pie" label="Dashboard" />
          {currentUser.role === 'ADMIN' && (
            <>
              <NavItem to="/games" icon="fa-futbol" label="Games Management" />
              <NavItem to="/referees" icon="fa-users-cog" label="Referees" />
              <NavItem to="/reports" icon="fa-file-invoice-dollar" label="Reports & Pay" />
            </>
          )}
          {currentUser.role === 'REFEREE' && (
             <>
               <NavItem to="/assignments" icon="fa-clipboard-list" label="My Assignments" />
               <NavItem to="/availability" icon="fa-calendar-alt" label="Availability" />
             </>
          )}
        </nav>

        <div className="relative z-10 p-4 border-t border-navy-800 bg-navy-900 bg-opacity-90">
          <div className="flex items-center space-x-3 mb-4">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-gold-400" />
            <div>
              <p className="text-sm font-semibold truncate w-32">{currentUser.name}</p>
              <p className="text-xs text-gray-400 flex items-center">
                  {currentUser.isSuperAdmin ? (
                      <span className="text-gold-400"><i className="fas fa-star mr-1"></i> Super Admin</span>
                  ) : (
                      currentUser.role
                  )}
              </p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition shadow"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
        {/* Subtle Referee Background Pattern (Light Theme) */}
        <RefereeBackground theme="light" opacity="opacity-[0.03]" className="z-0" />

        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 md:px-8 z-10 relative">
          <h2 className="text-xl font-semibold text-navy-900">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').replace('-', ' ').toUpperCase()}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-navy-900">
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};