import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Game, GameType, RefereePosition, User, Availability } from '../types';
import { backend } from '../services/mockBackend';
import { FieldInfoModal } from '../components/FieldInfoModal';

export const GameManagement: React.FC = () => {
  const { games, users, availabilities, updateGame, currentUser } = useApp();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFieldForMap, setSelectedFieldForMap] = useState<{name: string, city: string} | null>(null);
  const [filterRefereeId, setFilterRefereeId] = useState<string>('');

  const handleCreate = () => {
    if (!currentUser) return;
    
    const newGame: Game = {
      id: Date.now().toString(),
      // Default to user's group, or if Super Admin, default to first group or empty (logic here handles simple assignment)
      groupId: currentUser.groupId || 'g_a', 
      type: 'OUTDOOR',
      homeTeam: '',
      awayTeam: '',
      field: '',
      locationCity: '',
      date: '',
      time: '',
      assignments: backend.getDefinitions('OUTDOOR').map(role => ({ 
        role, 
        userId: null, 
        fee: 0, 
        status: 'PENDING',
        paymentStatus: 'UNPAID' 
      }))
    };
    setEditingGame(newGame);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editingGame) {
      await updateGame(editingGame);
      setShowModal(false);
      setEditingGame(null);
    }
  };

  const handleAssignmentChange = (index: number, userId: string) => {
    if (!editingGame) return;
    const newAssignments = [...editingGame.assignments];
    newAssignments[index] = {
        ...newAssignments[index],
        userId: userId === 'UNASSIGNED' ? null : userId,
        status: 'PENDING' // Reset status on change
    };
    setEditingGame({ ...editingGame, assignments: newAssignments });
  };

    const handleFeeChange = (index: number, fee: number) => {
    if (!editingGame) return;
    const newAssignments = [...editingGame.assignments];
    newAssignments[index] = { ...newAssignments[index], fee };
    setEditingGame({ ...editingGame, assignments: newAssignments });
  };

  const handleGameTypeChange = (type: GameType) => {
     if (!editingGame) return;
     const definitions = backend.getDefinitions(type);
     setEditingGame({
         ...editingGame,
         type,
         assignments: definitions.map(role => ({ 
             role, 
             userId: null, 
             fee: 0, 
             status: 'PENDING',
             paymentStatus: 'UNPAID' 
         }))
     });
  };

  // Robust availability checker
  const checkAvailability = (userId: string, date: string, time: string): { available: boolean, reason?: string } => {
    const userAvail = availabilities.filter(a => a.userId === userId && a.date === date);
    
    // 1. Check Explicit Unavailable (Iterate ALL blocks to ensure no conflict)
    const unavailableBlocks = userAvail.filter(a => a.type === 'UNAVAILABLE');
    for (const block of unavailableBlocks) {
        if (!block.startTime) return { available: false, reason: '(Unavailable All Day)' };
        if (time >= block.startTime && time <= (block.endTime || '23:59')) {
             return { available: false, reason: `(Busy ${block.startTime})` };
        }
    }

    // 2. Check Explicit Available (If ANY 'AVAILABLE' records exist for this day, we enforce them)
    const explicitAvailable = userAvail.filter(a => a.type === 'AVAILABLE');
    if (explicitAvailable.length > 0) {
        const match = explicitAvailable.some(a => {
            const start = a.startTime || '00:00';
            const end = a.endTime || '23:59';
            return time >= start && time <= end;
        });
        if (match) return { available: true, reason: '(Avail)' };
        else return { available: false, reason: '(Outside Avail. Window)' };
    }

    // 3. Default (No records) -> Assumed Available
    return { available: true, reason: '' };
  };

  const getAvailabilityStatus = (userId: string, date: string, time: string) => {
    const result = checkAvailability(userId, date, time);
    if (!result.available) {
        return { label: result.reason || '(Unavail)', color: 'text-red-500 font-bold' };
    }
    if (result.reason === '(Avail)') {
        return { label: '(Avail)', color: 'text-green-600 font-bold' };
    }
    return { label: '', color: '' };
  };

  const filteredGames = games.filter(game => {
      if (!filterRefereeId) return true;
      return checkAvailability(filterRefereeId, game.date, game.time).available;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-navy-900">Game Management</h1>
        
        <div className="flex space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <select 
                    className="w-full appearance-none border border-gray-300 bg-white text-gray-700 py-2 px-4 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-navy-900"
                    value={filterRefereeId}
                    onChange={(e) => setFilterRefereeId(e.target.value)}
                >
                    <option value="">Filter by Referee Availability...</option>
                    {users.filter(u => u.role === 'REFEREE').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-filter text-xs"></i>
                </div>
            </div>

            <button 
            onClick={handleCreate}
            className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-2 px-4 rounded shadow transition whitespace-nowrap"
            >
            <i className="fas fa-plus mr-2"></i> Add Game
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredGames.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            {filterRefereeId ? "No games found where this referee is available." : "No games found."}
                        </td>
                    </tr>
                ) : (
                    filteredGames.map(game => {
                        const filled = game.assignments.filter(a => a.userId).length;
                        const total = game.assignments.length;
                        return (
                            <tr key={game.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-navy-900">{game.homeTeam} vs {game.awayTeam}</div>
                                    <div className="text-xs text-gray-500">{game.date} @ {game.time}</div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">{game.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{game.field}</div>
                                    <button 
                                        onClick={() => setSelectedFieldForMap({ name: game.field, city: game.locationCity })}
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                                    >
                                        <i className="fas fa-map-marker-alt mr-1"></i> Map Info
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-gold-400 h-2.5 rounded-full" style={{ width: `${(filled/total)*100}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 block">{filled}/{total} Assigned</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => { setEditingGame(game); setShowModal(true); }}
                                        className="text-navy-900 hover:text-blue-600 font-medium"
                                    >
                                        Edit / Assign
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && editingGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
                <div className="bg-navy-900 px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-xl font-bold text-white">Edit Game Details</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Home Team</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={editingGame.homeTeam} onChange={e => setEditingGame({...editingGame, homeTeam: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Away Team</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={editingGame.awayTeam} onChange={e => setEditingGame({...editingGame, awayTeam: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={editingGame.type} onChange={e => handleGameTypeChange(e.target.value as GameType)}>
                                <option value="OUTDOOR">Outdoor Soccer</option>
                                <option value="FUTSAL">Futsal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Field Name</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={editingGame.field} onChange={e => setEditingGame({...editingGame, field: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={editingGame.locationCity} onChange={e => setEditingGame({...editingGame, locationCity: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={editingGame.date} onChange={e => setEditingGame({...editingGame, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input type="time" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={editingGame.time} onChange={e => setEditingGame({...editingGame, time: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div>
                        <h3 className="text-lg font-medium text-navy-900 mb-3">Referee Assignments</h3>
                        <div className="space-y-3">
                            {editingGame.assignments.map((assign, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <div className="w-full md:w-1/4">
                                        <span className="text-sm font-bold text-gray-700">{assign.role}</span>
                                    </div>
                                    <div className="w-full md:w-2/4">
                                        <select 
                                            className="w-full border border-gray-300 rounded-md text-sm p-2"
                                            value={assign.userId || 'UNASSIGNED'}
                                            onChange={(e) => handleAssignmentChange(idx, e.target.value)}
                                        >
                                            <option value="UNASSIGNED">-- Unassigned --</option>
                                            {users.filter(u => u.role === 'REFEREE').map(u => {
                                                const status = getAvailabilityStatus(u.id, editingGame.date, editingGame.time);
                                                return (
                                                    <option key={u.id} value={u.id} className={status.color ? status.color : ''}>
                                                        {u.name} {status.label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/4 relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-6 border border-gray-300 rounded-md text-sm p-2"
                                            value={assign.fee}
                                            onChange={(e) => handleFeeChange(idx, parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-auto">
                                        {assign.status === 'ACCEPTED' && <i className="fas fa-check-circle text-green-500" title="Accepted"></i>}
                                        {assign.status === 'DECLINED' && <i className="fas fa-times-circle text-red-500" title="Declined"></i>}
                                        {assign.status === 'PENDING' && assign.userId && <i className="fas fa-question-circle text-yellow-500" title="Pending"></i>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800">Save Assignments</button>
                </div>
            </div>
        </div>
      )}

      {selectedFieldForMap && (
          <FieldInfoModal 
            isOpen={!!selectedFieldForMap} 
            onClose={() => setSelectedFieldForMap(null)}
            fieldName={selectedFieldForMap.name}
            city={selectedFieldForMap.city}
          />
      )}
    </div>
  );
};