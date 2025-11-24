import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FieldInfoModal } from '../components/FieldInfoModal';

export const RefereeDashboard: React.FC = () => {
  const { currentUser, games, respondToAssignment, updateBankDetails } = useApp();
  const [selectedField, setSelectedField] = useState<{name: string, city: string} | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    accountHolder: currentUser?.name || '',
    bankName: '',
    routingNumber: '',
    accountNumber: ''
  });

  const myGames = games.filter(g => 
    g.assignments.some(a => a.userId === currentUser?.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!currentUser) return null;

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBankDetails(bankForm);
    setShowBankModal(false);
    // Reset sensitive fields
    setBankForm(prev => ({ ...prev, accountNumber: '', routingNumber: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border-l-4 border-gold-400">
            <h2 className="text-2xl font-bold text-navy-900">Welcome back, {currentUser.name}</h2>
            <p className="text-gray-600">You have {myGames.filter(g => 
                g.assignments.find(a => a.userId === currentUser.id)?.status === 'PENDING'
            ).length} pending assignments.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy-900">Payment Settings</h3>
                    <i className="fas fa-lock text-green-600"></i>
                </div>
                
                {currentUser.bankDetails ? (
                    <div>
                        <p className="text-sm text-gray-500">Direct Deposit Active</p>
                        <div className="mt-2 flex items-center space-x-2">
                             <div className="bg-gray-100 p-2 rounded text-navy-900 font-bold text-sm">
                                {currentUser.bankDetails.bankName}
                             </div>
                             <div className="text-gray-600 text-sm">
                                {currentUser.bankDetails.accountNumberMasked}
                             </div>
                        </div>
                        <button 
                            onClick={() => setShowBankModal(true)}
                            className="mt-4 text-xs text-blue-600 hover:underline"
                        >
                            Update Banking Info
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 mb-3">No payment method set.</p>
                        <button 
                            onClick={() => setShowBankModal(true)}
                            className="w-full bg-navy-900 text-white text-sm py-2 rounded hover:bg-navy-800 transition"
                        >
                            Setup Direct Deposit
                        </button>
                    </div>
                )}
             </div>
             {/* Background Lock Icon */}
             <i className="fas fa-shield-alt absolute -bottom-6 -right-6 text-8xl text-gray-100 z-0"></i>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h3 className="text-xl font-bold text-navy-900">My Assignments</h3>
        {myGames.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No assignments yet.</p>
        ) : (
            myGames.map(game => {
                const myAssign = game.assignments.find(a => a.userId === currentUser.id);
                if (!myAssign) return null;

                return (
                    <div key={game.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-6 flex flex-col md:flex-row justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="bg-navy-900 text-white text-xs font-bold px-2 py-1 rounded uppercase">{game.type}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${
                                        myAssign.status === 'ACCEPTED' ? 'border-green-500 text-green-700' :
                                        myAssign.status === 'DECLINED' ? 'border-red-500 text-red-700' :
                                        'border-yellow-500 text-yellow-700'
                                    }`}>
                                        {myAssign.status}
                                    </span>
                                    {myAssign.paymentStatus === 'PAID' && (
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase border border-green-200">
                                            <i className="fas fa-check mr-1"></i> Paid
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{game.homeTeam} vs {game.awayTeam}</h3>
                                <div className="flex items-center text-gray-600 space-x-4 text-sm">
                                    <span><i className="far fa-calendar-alt mr-1"></i> {game.date}</span>
                                    <span><i className="far fa-clock mr-1"></i> {game.time}</span>
                                </div>
                                <div className="flex items-center text-blue-600 cursor-pointer hover:underline text-sm"
                                     onClick={() => setSelectedField({ name: game.field, city: game.locationCity })}>
                                    <i className="fas fa-map-marker-alt mr-1"></i> {game.field}, {game.locationCity}
                                </div>
                                <div className="pt-2">
                                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Role: {myAssign.role}</span>
                                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded ml-2">Pay: ${myAssign.fee}</span>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 flex flex-col justify-center space-y-2 md:w-48">
                                {myAssign.status === 'PENDING' && (
                                    <>
                                        <button 
                                            onClick={() => respondToAssignment(game.id, myAssign.role, 'ACCEPTED')}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => respondToAssignment(game.id, myAssign.role, 'DECLINED')}
                                            className="w-full bg-white border border-red-500 text-red-500 hover:bg-red-50 font-bold py-2 px-4 rounded transition"
                                        >
                                            Decline
                                        </button>
                                    </>
                                )}
                                {myAssign.status === 'ACCEPTED' && (
                                    <div className="text-center text-green-600 font-medium">
                                        <i className="fas fa-check-circle text-2xl mb-1 block"></i>
                                        Assignment Confirmed
                                    </div>
                                )}
                                {myAssign.status === 'DECLINED' && (
                                    <div className="text-center text-gray-400">
                                        <i className="fas fa-ban text-2xl mb-1 block"></i>
                                        Declined
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {selectedField && (
        <FieldInfoModal 
            isOpen={!!selectedField}
            onClose={() => setSelectedField(null)}
            fieldName={selectedField.name}
            city={selectedField.city}
        />
      )}

      {/* Secure Bank Details Modal */}
      {showBankModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-navy-900 p-4 flex justify-between items-center">
                      <div className="flex items-center text-white space-x-2">
                          <i className="fas fa-shield-alt text-gold-400 text-xl"></i>
                          <h3 className="font-bold text-lg">Secure Direct Deposit</h3>
                      </div>
                      <button onClick={() => setShowBankModal(false)} className="text-gray-300 hover:text-white">
                          <i className="fas fa-times"></i>
                      </button>
                  </div>
                  
                  <form onSubmit={handleBankSubmit} className="p-6 space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start space-x-3">
                          <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                          <p className="text-xs text-blue-700">
                              Your banking information is encrypted and stored securely. It is only used for processing payout distributions.
                          </p>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                          <input 
                              type="text" 
                              required
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                              value={bankForm.accountHolder}
                              onChange={e => setBankForm({...bankForm, accountHolder: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                          <input 
                              type="text" 
                              required
                              placeholder="e.g., Chase, Wells Fargo"
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                              value={bankForm.bankName}
                              onChange={e => setBankForm({...bankForm, bankName: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                              <input 
                                  type="text" 
                                  required
                                  pattern="\d{9}"
                                  title="9 Digit Routing Number"
                                  maxLength={9}
                                  placeholder="9 digits"
                                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                                  value={bankForm.routingNumber}
                                  onChange={e => setBankForm({...bankForm, routingNumber: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                              <input 
                                  type="password" 
                                  required
                                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-navy-900 outline-none"
                                  value={bankForm.accountNumber}
                                  onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                              />
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition flex items-center justify-center"
                      >
                          <i className="fas fa-lock mr-2"></i> Save Securely
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};