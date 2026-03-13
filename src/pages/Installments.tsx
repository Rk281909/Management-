import React, { useState } from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { Search, CheckCircle, AlertCircle, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Installments() {
  const { installments, loans, customers, staff, updateInstallmentStatus, currentStaffId } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionModal, setCollectionModal] = useState<{ isOpen: boolean, installmentId: string | null }>({ isOpen: false, installmentId: null });
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Check'>('Cash');

  const getLoanDetails = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    const customer = customers.find(c => c.id === loan?.customerId);
    return { loan, customer };
  };

  const getStaffName = (id?: string) => {
    if (!id) return '-';
    return staff.find(s => s.id === id)?.name || 'Unknown';
  };

  const filteredInstallments = installments.filter(inst => {
    const { customer } = getLoanDetails(inst.loanId);
    return inst.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer?.name.toLowerCase() || '').includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleCollect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!collectionModal.installmentId) return;

    const formData = new FormData(e.currentTarget);
    const referenceNo = formData.get('referenceNo') as string;

    updateInstallmentStatus(collectionModal.installmentId, 'paid', {
      paymentMethod,
      referenceNo: paymentMethod === 'Check' ? referenceNo : undefined,
      staffId: currentStaffId
    });

    setCollectionModal({ isOpen: false, installmentId: null });
    setPaymentMethod('Cash');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const activeInstallment = installments.find(i => i.id === collectionModal.installmentId);
  const activeLoanDetails = activeInstallment ? getLoanDetails(activeInstallment.loanId) : null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">Installment Collection</motion.h1>
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

      {/* Installments List */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium">Installment ID</th>
                <th className="p-4 font-medium">Loan ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium text-right">Amount (Rs.)</th>
                <th className="p-4 font-medium">Status / Staff</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredInstallments.map(inst => {
                  const { customer } = getLoanDetails(inst.loanId);
                  const isOverdue = inst.status === 'pending' && new Date(inst.dueDate) < new Date();
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={inst.id} 
                      className={`hover:bg-white/5 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}
                    >
                      <td className="p-4 text-sm font-medium text-slate-300">{inst.id}</td>
                      <td className="p-4 text-sm text-slate-300">{inst.loanId}</td>
                      <td className="p-4 text-sm text-slate-200">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-cyan-400" />
                          {customer?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        <span className={isOverdue ? 'text-red-400 font-medium flex items-center' : ''}>
                          {isOverdue && <AlertCircle className="h-4 w-4 mr-1" />}
                          {inst.dueDate}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-cyan-400 text-right">{inst.amount.toLocaleString()}</td>
                      <td className="p-4 text-sm">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            inst.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                            isOverdue ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {inst.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                          {inst.status === 'paid' && inst.staffId && (
                            <span className="text-xs text-slate-500">By: {getStaffName(inst.staffId)}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-right">
                        {inst.status !== 'paid' ? (
                          <button 
                            onClick={() => setCollectionModal({ isOpen: true, installmentId: inst.id })}
                            className="text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Collect
                          </button>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-slate-500 text-xs">Paid on {inst.paidDate}</span>
                            {inst.paymentMethod && (
                              <span className="text-slate-600 text-xs mt-0.5">{inst.paymentMethod} {inst.referenceNo ? `(${inst.referenceNo})` : ''}</span>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredInstallments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No installments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Collection Modal */}
      <AnimatePresence>
        {collectionModal.isOpen && activeInstallment && activeLoanDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-xl font-bold text-white">Collect Installment</h2>
                <button onClick={() => { setCollectionModal({ isOpen: false, installmentId: null }); setPaymentMethod('Cash'); }} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Amount Due:</span>
                  <span className="text-xl font-bold text-emerald-400">Rs. {activeInstallment.amount.toLocaleString()}</span>
                </div>
                <div className="space-y-1 mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Customer:</span> <span className="text-white font-medium">{activeLoanDetails.customer?.name}</span></p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Loan ID:</span> {activeInstallment.loanId}</p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Due Date:</span> {activeInstallment.dueDate}</p>
                </div>
              </div>
              
              <form className="space-y-4 relative z-10" onSubmit={handleCollect}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Check')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all [&>option]:bg-slate-900"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                  </select>
                </div>

                {paymentMethod === 'Check' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Check Number</label>
                    <input name="referenceNo" required type="text" placeholder="Enter check number" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                  </motion.div>
                )}
                
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => { setCollectionModal({ isOpen: false, installmentId: null }); setPaymentMethod('Cash'); }} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    Confirm Collection
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
