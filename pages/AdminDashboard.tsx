import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Game } from '../types';

export const AdminDashboard: React.FC = () => {
  const { games, users, sendAdminReport, triggerGameReminders, sendManualNotification } = useApp();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Manual Notification State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const totalGames = games.length;
  const pendingAssignments = games.reduce((acc, g) => 
    acc + g.assignments.filter(a => a.userId === null).length, 0
  );
  const activeRefs = users.filter(u => u.role === 'REFEREE').length;
  const pendingApprovals = games.reduce((acc, g) =>
    acc + g.assignments.filter(a => a.status === 'PENDING' && a.userId !== null).length, 0
  );

  const today = new Date().toISOString().split('T')[0];

  const upcomingGames = games
    .filter(g => g.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastGames = games
    .filter(g => g.date < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEmailReport = async () => {
    setSendingEmail(true);
    await sendAdminReport();
    setSendingEmail(false);
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    await triggerGameReminders();
    setSendingReminders(false);
  };

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendManualNotification(manualForm);
    setShowManualModal(false);
    setManualForm({ email: '', phone: '', subject: '', message: '' });
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-navy-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color}`}>
        <i className={`fas ${icon} text-lg`}></i>
      </div>
    </div>
  );

  const GameListSection = ({ title, data }: { title: string, data: Game[] }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-navy-900 text-lg">{title}</h3>
        <Link to="/games" className="text-sm text-blue-600 hover:underline">View All</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-2">Match</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
               <tr><td colSpan={3} className="py-4 text-sm text-gray-500 text-center">No games found.</td></tr>
            ) : (
               data.slice(0, 5).map(g => {
              const isFullyStaffed = g.assignments.every(a => a.userId !== null);
              return (
                <tr key={g.id}>
                  <td className="py-3">
                    <div className="font-medium text-gray-900">{g.homeTeam} vs {g.awayTeam}</div>
                    <div className="text-xs text-gray-500">{g.field}</div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{g.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      isFullyStaffed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isFullyStaffed ? 'Staffed' : 'Open Slots'}
                    </span>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Games" value={totalGames} icon="fa-futbol" color="bg-blue-500" />
        <StatCard title="Open Slots" value={pendingAssignments} icon="fa-user-plus" color="bg-gold-500" />
        <StatCard title="Active Refs" value={activeRefs} icon="fa-users" color="bg-green-500" />
        <StatCard title="Pending Accept" value={pendingApprovals} icon="fa-clock" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GameListSection title="Upcoming Games" data={upcomingGames} />
          <GameListSection title="Past Games" data={pastGames} />
        </div>

        <div className="bg-navy-900 rounded-xl shadow-sm p-6 text-white h-fit sticky top-6">
          <h3 className="font-bold text-gold-400 text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/games" className="bg-navy-800 hover:bg-navy-700 p-4 rounded-lg flex items-center space-x-4 transition group">
              <div className="bg-navy-900 p-3 rounded-full group-hover:bg-gold-400 group-hover:text-navy-900 transition">
                 <i className="fas fa-plus-circle text-xl"></i>
              </div>
              <span className="font-bold">New Game</span>
            </Link>
            <button 
                onClick={handleEmailReport}
                disabled={sendingEmail}
                className={`bg-navy-800 hover:bg-navy-700 p-4 rounded-lg flex items-center space-x-4 transition group ${sendingEmail ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
               <div className="bg-navy-900 p-3 rounded-full group-hover:bg-gold-400 group-hover:text-navy-900 transition">
                <i className={`fas ${sendingEmail ? 'fa-circle-notch fa-spin' : 'fa-envelope-open-text'} text-xl`}></i>
               </div>
               <span className="font-bold">{sendingEmail ? 'Sending Report...' : 'Email Game Report'}</span>
            </button>
            <Link to="/reports" className="bg-navy-800 hover:bg-navy-700 p-4 rounded-lg flex items-center space-x-4 transition group">
              <div className="bg-navy-900 p-3 rounded-full group-hover:bg-gold-400 group-hover:text-navy-900 transition">
                <i className="fas fa-file-download text-xl"></i>
              </div>
              <span className="font-bold">Export Payroll</span>
            </Link>
            <button 
                onClick={handleSendReminders}
                disabled={sendingReminders}
                className={`bg-navy-800 hover:bg-navy-700 p-4 rounded-lg flex items-center space-x-4 transition group ${sendingReminders ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
               <div className="bg-navy-900 p-3 rounded-full group-hover:bg-gold-400 group-hover:text-navy-900 transition">
                <i className={`fas ${sendingReminders ? 'fa-circle-notch fa-spin' : 'fa-bell'} text-xl`}></i>
               </div>
               <span className="font-bold">{sendingReminders ? 'Sending...' : 'Send Daily Reminders'}</span>
            </button>

            {/* Manual Notification Button */}
            <button 
                onClick={() => setShowManualModal(true)}
                className="bg-navy-800 hover:bg-navy-700 p-4 rounded-lg flex items-center space-x-4 transition group"
            >
               <div className="bg-navy-900 p-3 rounded-full group-hover:bg-gold-400 group-hover:text-navy-900 transition">
                <i className="fas fa-paper-plane text-xl"></i>
               </div>
               <span className="font-bold">Manual Notification</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Notification Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
             <div className="bg-navy-900 p-4 flex justify-between items-center rounded-t-xl">
               <h3 className="text-white font-bold text-lg">Send Manual Notification</h3>
               <button onClick={() => setShowManualModal(false)} className="text-gray-300 hover:text-white">
                 <i className="fas fa-times"></i>
               </button>
             </div>
             <form onSubmit={handleManualSend} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                   <input 
                     type="email" required
                     className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                     value={manualForm.email}
                     onChange={e => setManualForm({...manualForm, email: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
                   <input 
                     type="tel" required
                     className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                     value={manualForm.phone}
                     onChange={e => setManualForm({...manualForm, phone: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                   <input 
                     type="text" required
                     className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                     value={manualForm.subject}
                     onChange={e => setManualForm({...manualForm, subject: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                   <textarea 
                     required
                     rows={4}
                     className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                     value={manualForm.message}
                     onChange={e => setManualForm({...manualForm, message: e.target.value})}
                   ></textarea>
                   <p className="text-xs text-gray-500 mt-1">System will automatically append "Do NOT reply" to SMS.</p>
                </div>
                <div className="pt-2">
                   <button type="submit" className="w-full bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-3 rounded-lg shadow">
                      Send Notification (Email & SMS)
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};