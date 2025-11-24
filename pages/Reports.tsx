import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const Reports: React.FC = () => {
  const { games, users, markAsPaid, isLoading } = useApp();
  
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterReferee, setFilterReferee] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Flatten games into individual payable assignments (only ACCEPTED assignments need payment)
  const reportData = useMemo(() => {
    const rows: any[] = [];
    games.forEach(game => {
      game.assignments.forEach(assign => {
        // We only care about assignments that are assigned to a person and ACCEPTED (or if you want to show Pending liabilities, adjust here)
        // Usually you only pay for ACCEPTED/Completed work.
        if (assign.userId && assign.status === 'ACCEPTED') {
          
          // Date Filtering
          if (filterStart && game.date < filterStart) return;
          if (filterEnd && game.date > filterEnd) return;

          // Referee Filtering
          if (filterReferee && assign.userId !== filterReferee) return;

          // Payment Status Filtering
          if (filterPaymentStatus !== 'ALL' && assign.paymentStatus !== filterPaymentStatus) return;

          const user = users.find(u => u.id === assign.userId);
          
          rows.push({
            id: `${game.id}-${assign.role}`,
            gameId: game.id,
            date: game.date,
            home: game.homeTeam,
            away: game.awayTeam,
            refereeName: user?.name || 'Unknown',
            userId: assign.userId,
            userBankDetails: user?.bankDetails,
            role: assign.role,
            fee: assign.fee,
            status: assign.paymentStatus,
            paidAt: assign.paidAt
          });
        }
      });
    });
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [games, users, filterStart, filterEnd, filterReferee, filterPaymentStatus]);

  const totalLiability = reportData.reduce((sum, item) => item.status === 'UNPAID' ? sum + item.fee : sum, 0);
  const totalPaid = reportData.reduce((sum, item) => item.status === 'PAID' ? sum + item.fee : sum, 0);

  const handlePayment = async (row: any) => {
      setProcessingId(row.id);
      await markAsPaid(row.gameId, row.role);
      setProcessingId(null);
  };

  const downloadCSV = () => {
    const headers = "Date,Game,Referee,Role,Fee,Status,Paid Date,Method\n";
    const rows = reportData.map(r => {
      const method = r.userBankDetails ? "Direct Deposit" : "Manual Check";
      return `${r.date},"${r.home} vs ${r.away}",${r.refereeName},${r.role},${r.fee},${r.status},${r.paidAt || ''},${method}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'financial_report.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-navy-900">Payroll & Financials</h2>
        <button 
            onClick={downloadCSV}
            className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow"
        >
            <i className="fas fa-file-csv mr-2"></i> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filterStart}
                onChange={e => setFilterStart(e.target.value)}
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filterEnd}
                onChange={e => setFilterEnd(e.target.value)}
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Referee</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filterReferee}
                onChange={e => setFilterReferee(e.target.value)}
              >
                <option value="">All Referees</option>
                {users.filter(u => u.role === 'REFEREE').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Status</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filterPaymentStatus}
                onChange={e => setFilterPaymentStatus(e.target.value as any)}
              >
                <option value="ALL">All</option>
                <option value="UNPAID">Unpaid / Outstanding</option>
                <option value="PAID">Paid</option>
              </select>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-gold-400 text-sm uppercase font-bold">Outstanding Balance</h3>
                <p className="text-4xl font-bold mt-2">${totalLiability.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">To be paid for accepted games</p>
              </div>
              <i className="fas fa-wallet text-gray-700 text-8xl absolute -bottom-4 -right-4 opacity-20"></i>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm uppercase font-bold">Total Paid (Period)</h3>
              <p className="text-4xl font-bold text-green-600 mt-2">${totalPaid.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm uppercase font-bold">Assignments Count</h3>
              <p className="text-4xl font-bold text-navy-900 mt-2">{reportData.length}</p>
          </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fee</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {reportData.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No assignments found matching filters.</td>
                     </tr>
                  ) : (
                    reportData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.date}</td>
                            <td className="px-6 py-4 text-sm font-medium text-navy-900">
                              {row.home} vs {row.away}
                              <div className="text-xs text-gray-500">ID: {row.gameId}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-800 font-medium">{row.refereeName}</div>
                                {row.userBankDetails && (
                                    <div className="text-xs text-green-600 flex items-center">
                                        <i className="fas fa-check-circle mr-1"></i> DD Active
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{row.role}</td>
                            <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">${row.fee}</td>
                            <td className="px-6 py-4 text-center">
                                {row.status === 'PAID' ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                                    Paid on {row.paidAt}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">
                                    Unpaid
                                  </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {row.status === 'UNPAID' && (
                                  <button 
                                    onClick={() => handlePayment(row)}
                                    disabled={processingId === row.id}
                                    className={`text-xs px-3 py-1 rounded shadow transition flex items-center justify-center mx-auto min-w-[100px]
                                        ${row.userBankDetails 
                                            ? 'bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold' 
                                            : 'bg-navy-900 hover:bg-blue-800 text-white'}`}
                                  >
                                    {processingId === row.id ? (
                                        <i className="fas fa-circle-notch fa-spin"></i>
                                    ) : (
                                        row.userBankDetails ? (
                                            <>
                                                <i className="fas fa-bolt mr-1"></i> Pay (DD)
                                            </>
                                        ) : 'Manual Pay'
                                    )}
                                  </button>
                                )}
                                {row.status === 'PAID' && (
                                  <span className="text-green-500 text-lg">
                                    <i className="fas fa-check-circle"></i>
                                  </span>
                                )}
                            </td>
                        </tr>
                    ))
                  )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};