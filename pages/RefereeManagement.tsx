import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const RefereeManagement: React.FC = () => {
  const { users, currentUser, groups, createReferee } = useApp();
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(currentUser?.groupId || '');

  // Filter only referees from the users list (which is already filtered by AppContext)
  const referees = users.filter(u => u.role === 'REFEREE');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReferee(newName, newEmail, newPhone, selectedGroup);
    setShowModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  const getGroupName = (gid?: string) => {
      return groups.find(g => g.id === gid)?.name || 'Unassigned';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-navy-900">Referee Management</h2>
            <p className="text-gray-500 text-sm mt-1">
                {currentUser?.isSuperAdmin 
                    ? 'Super Admin Access: Managing all referees.' 
                    : `Managing referees for: ${getGroupName(currentUser?.groupId)}`}
            </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-2 px-4 rounded shadow flex items-center"
        >
          <i className="fas fa-user-plus mr-2"></i> Create Referee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Info</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {referees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No referees found in this group.</td>
              </tr>
            ) : (
              referees.map(ref => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img src={ref.avatar} alt={ref.name} className="w-10 h-10 rounded-full bg-gray-200" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">{ref.name}</div>
                        <div className="text-xs text-gray-400">ID: {ref.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600"><i className="fas fa-envelope mr-2 w-4"></i> {ref.email}</div>
                    <div className="text-sm text-gray-600"><i className="fas fa-phone mr-2 w-4"></i> {ref.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {getGroupName(ref.groupId)}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    {ref.bankDetails ? (
                        <span className="text-green-600 text-sm flex items-center">
                            <i className="fas fa-check-circle mr-1"></i> On File
                        </span>
                    ) : (
                        <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-gray-400 hover:text-navy-900">
                        <i className="fas fa-ellipsis-v"></i>
                     </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Referee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-navy-900 p-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-white font-bold text-lg">Create Referee Account</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-navy-900 focus:border-navy-900"
                  value={newName} onChange={e => setNewName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-navy-900 focus:border-navy-900"
                  value={newEmail} onChange={e => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input 
                  type="tel" required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-navy-900 focus:border-navy-900"
                  value={newPhone} onChange={e => setNewPhone(e.target.value)}
                />
              </div>

              {/* If Super Admin, allow group selection */}
              {currentUser?.isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assign to Group</label>
                    <select 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={selectedGroup}
                        onChange={e => setSelectedGroup(e.target.value)}
                    >
                        <option value="">-- Select Group --</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                  </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-navy-900 text-white font-bold py-3 rounded-lg hover:bg-navy-800 transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};