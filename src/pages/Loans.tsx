import React, { useState } from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { Search, Plus, CheckCircle, XCircle, FileText, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Loans() {
  const { loans, customers, staff, addLoan, updateLoanStatus, currentStaffId } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getStaffName = (id?: string) => {
    if (!id) return '-';
    return staff.find(s => s.id === id)?.name || 'Unknown';
  };

  const filteredLoans = loans.filter(loan => 
    loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(loan.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">Loan Management</motion.h1>
        <motion.button 
          variants={itemVariants}
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Loan Application
        </motion.button>
      </div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="glass-panel p-4 rounded-xl flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search by Loan ID or Customer Name..." 
          className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Loans List */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium">Loan ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount (Rs.)</th>
                <th className="p-4 font-medium">Interest (%)</th>
                <th className="p-4 font-medium">Duration (Mo)</th>
                <th className="p-4 font-medium">Status / Staff</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredLoans.map(loan => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={loan.id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-slate-300">{loan.id}</td>
                    <td className="p-4 text-sm text-slate-200">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-cyan-400" />
                        {getCustomerName(loan.customerId)}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-cyan-400">{loan.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-400">{loan.interestRate}%</td>
                    <td className="p-4 text-sm text-slate-400">{loan.durationMonths}</td>
                    <td className="p-4 text-sm">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          loan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          loan.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          loan.status === 'approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          loan.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {loan.status}
                        </span>
                        {loan.staffId && (
                          <span className="text-xs text-slate-500">By: {getStaffName(loan.staffId)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-right space-x-2">
                      {loan.status === 'pending' && (
                        <>
                          <button onClick={() => updateLoanStatus(loan.id, 'approved', currentStaffId)} className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-500/10 rounded-lg transition-colors" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateLoanStatus(loan.id, 'rejected', currentStaffId)} className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/10 rounded-lg transition-colors" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {loan.status === 'approved' && (
                        <button onClick={() => updateLoanStatus(loan.id, 'active', currentStaffId)} className="text-blue-400 hover:text-blue-300 p-1.5 bg-blue-500/10 rounded-lg px-3 border border-blue-500/20 transition-colors" title="Disburse">
                          Disburse
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-white p-1.5 bg-white/5 rounded-lg transition-colors" title="Details">
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Loan Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white">New Loan Application</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form className="space-y-4 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addLoan({
                  customerId: formData.get('customerId') as string,
                  amount: Number(formData.get('amount')),
                  interestRate: Number(formData.get('interestRate')),
                  durationMonths: Number(formData.get('durationMonths')),
                  status: 'pending',
                  remainingBalance: Number(formData.get('amount')),
                  appliedDate: new Date().toISOString().split('T')[0],
                  staffId: currentStaffId
                });
                setIsAddModalOpen(false);
              }}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Customer</label>
                  <select name="customerId" required className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all [&>option]:bg-slate-900">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Loan Amount (Rs.)</label>
                  <input name="amount" required type="number" min="1000" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Interest Rate (%)</label>
                    <input name="interestRate" required type="number" step="0.1" min="1" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Duration (Months)</label>
                    <input name="durationMonths" required type="number" min="1" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
