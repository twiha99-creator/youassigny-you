import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AvailabilityType } from '../types';

export const AvailabilityManagement: React.FC = () => {
  const { currentUser, availabilities, addAvailability, deleteAvailability } = useApp();
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AvailabilityType>('UNAVAILABLE');
  const [notes, setNotes] = useState('');

  if (!currentUser) return null;

  const myAvailability = availabilities
    .filter(a => a.userId === currentUser.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    await addAvailability({
      userId: currentUser.id,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      notes
    });

    // Reset form
    setDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy-900">My Availability</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h3 className="font-bold text-navy-900 mb-4 text-lg">Add Schedule Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <div className="mt-2 flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setType('UNAVAILABLE')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-lg border ${
                      type === 'UNAVAILABLE' 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('AVAILABLE')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-lg border ${
                      type === 'AVAILABLE' 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Available
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input 
                  type="date" 
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time (Opt)</label>
                  <input 
                    type="time" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time (Opt)</label>
                  <input 
                    type="time" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g., Vacation, Work"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-navy-900 text-white font-bold py-3 rounded-lg hover:bg-navy-800 transition shadow"
              >
                Add Rule
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {myAvailability.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
               <i className="far fa-calendar-times text-4xl text-gray-300 mb-3"></i>
               <p className="text-gray-500">No availability rules set.</p>
            </div>
          )}
          
          {myAvailability.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between group hover:border-navy-900 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-12 rounded-full ${item.type === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-navy-900">{item.date}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      item.type === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.startTime ? `${item.startTime} - ${item.endTime || 'End of day'}` : 'All Day'} 
                    {item.notes && <span className="text-gray-400 ml-2 italic">- {item.notes}</span>}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => deleteAvailability(item.id)}
                className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};