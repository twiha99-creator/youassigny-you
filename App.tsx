import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { RefereeDashboard } from './pages/RefereeDashboard';
import { GameManagement } from './pages/GameManagement';
import { Reports } from './pages/Reports';
import { AvailabilityManagement } from './pages/AvailabilityManagement';
import { RefereeManagement } from './pages/RefereeManagement';
import { LogoFull, RefereeBackground } from './components/Logo';
import { UserRole } from './types';

// Login Screen for Demo
const LoginScreen = () => {
  const { authenticate, register, isLoading } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  
  // Auth Modal State
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [targetRoleLabel, setTargetRoleLabel] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleRoleClick = (roleLabel: string) => {
    setTargetRoleLabel(roleLabel);
    setAuthMode('LOGIN');
    setRoleMenuOpen(false);
    setError('');
    
    // Pre-fill credentials for demo ease-of-use, but allow editing
    let defaultEmail = '';
    let defaultPass = '';

    if (roleLabel.includes('SuperAdmin')) {
        defaultEmail = 'twiha@live.com';
        defaultPass = 'Here2Help!!!';
    } else if (roleLabel.includes('Assignor')) {
        defaultEmail = 'twiha@live.com';
        defaultPass = 'Here2Help!!!';
    } else if (roleLabel.includes('Referee')) {
        defaultEmail = 'bob@ref.com';
        defaultPass = 'ref';
    }

    setFormData({ ...formData, email: defaultEmail, password: defaultPass, name: '', phone: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (authMode === 'LOGIN') {
        const user = await authenticate(formData.email, formData.password);
        if (!user) {
            setError("Invalid email or password. (Try the pre-filled demo credentials)");
        } else {
            setShowModal(false);
        }
    } else {
        // Signup Logic
        try {
            // Determine system role based on label
            let systemRole: UserRole = 'REFEREE';
            if (targetRoleLabel.includes('Assignor') || targetRoleLabel.includes('Admin')) {
                systemRole = 'ADMIN';
            }
            
            // Prevent super admin signup for demo safety, default to regular admin
            if (targetRoleLabel.includes('SuperAdmin')) {
                setError("Public registration for Super Admin is disabled.");
                return;
            }

            await register(formData.name, formData.email, formData.phone, systemRole);
            setShowModal(false);
        } catch (err) {
            setError("Registration failed. Please try again.");
        }
    }
  };

  const toggleMode = () => {
      setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
      setError('');
      // Clear passwords when switching
      setFormData(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white p-4 overflow-hidden">
      <RefereeBackground opacity="opacity-15" />
      
      <div className="relative z-10 mb-12 text-center transform scale-110">
         <LogoFull />
         <p className="text-gray-300 mt-4 font-medium tracking-wide bg-navy-900 bg-opacity-50 py-1 px-4 rounded-full">Referee Management System</p>
      </div>
      
      <div className="relative z-10 w-full max-w-xs">
        <button 
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="w-full bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-between transition-all outline-none ring-2 ring-offset-2 ring-offset-navy-900 ring-gold-400"
        >
            <span className="flex items-center text-lg"><i className="fas fa-sign-in-alt mr-3"></i> Login As...</span>
            <i className={`fas fa-chevron-down transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {roleMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeIn border border-gold-400">
                {['Admin (SuperAdmin)', 'Assignor (Group Admin)', 'Referee'].map((role) => (
                    <button
                        key={role}
                        onClick={() => handleRoleClick(role)}
                        className="w-full text-left px-6 py-4 text-navy-900 font-bold hover:bg-blue-50 border-b border-gray-100 last:border-0 flex justify-between items-center group transition-colors"
                    >
                        {role}
                        <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 text-gold-500 transition-all transform translate-x-[-10px] group-hover:translate-x-0"></i>
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="relative z-10 mt-12 text-xs text-gray-500">
          <p>Powered by React & Tailwind</p>
      </div>

      {/* Auth Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 backdrop-blur-sm">
              <div className="bg-white text-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                  <div className="bg-navy-900 p-4 flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">
                          {authMode === 'LOGIN' ? 'Login' : 'Create Account'} - <span className="text-gold-400">{targetRoleLabel.split('(')[0]}</span>
                      </h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                          <i className="fas fa-times"></i>
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}
                      
                      {authMode === 'SIGNUP' && (
                          <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy-900 outline-none"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
                                <input 
                                    type="tel" required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy-900 outline-none"
                                    placeholder="(555) 123-4567"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                          </>
                      )}

                      <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                          <input 
                              type="email" required
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy-900 outline-none"
                              placeholder="name@example.com"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                          <input 
                              type="password" required
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-navy-900 outline-none"
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={e => setFormData({...formData, password: e.target.value})}
                          />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-lg shadow transition flex justify-center items-center"
                      >
                        {isLoading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : null}
                        {authMode === 'LOGIN' ? 'Sign In' : 'Create Account'}
                      </button>

                      <div className="text-center pt-2 border-t border-gray-100">
                          <button 
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                              {authMode === 'LOGIN' 
                                ? "Don't have an account? Sign Up" 
                                : "Already have an account? Log In"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const MainRoutes = () => {
  const { currentUser } = useApp();

  if (!currentUser) return <LoginScreen />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={currentUser.role === 'ADMIN' ? <AdminDashboard /> : <RefereeDashboard />} />
        <Route path="/games" element={currentUser.role === 'ADMIN' ? <GameManagement /> : <Navigate to="/" />} />
        <Route path="/reports" element={currentUser.role === 'ADMIN' ? <Reports /> : <Navigate to="/" />} />
        <Route path="/referees" element={currentUser.role === 'ADMIN' ? <RefereeManagement /> : <Navigate to="/" />} />
        
        <Route path="/assignments" element={<RefereeDashboard />} />
        <Route path="/availability" element={currentUser.role === 'REFEREE' ? <AvailabilityManagement /> : <Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <React.Suspense fallback="Loading...">
      <AppProvider>
        <HashRouter>
          <MainRoutes />
        </HashRouter>
      </AppProvider>
    </React.Suspense>
  );
}