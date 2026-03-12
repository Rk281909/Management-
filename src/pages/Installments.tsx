import React, { useState } from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Installments() {
  const { installments, loans, customers, updateInstallmentStatus } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const getLoanDetails = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    const customer = customers.find(c => c.id === loan?.customerId);
    return { loan, customer };
  };

  const filteredInstallments = installments.filter(inst => {
    const { customer } = getLoanDetails(inst.loanId);
    return inst.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer?.name.toLowerCase() || '').includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

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
                <th className="p-4 font-medium">Status</th>
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
                      <td className="p-4 text-sm text-slate-200">{customer?.name || 'Unknown'}</td>
                      <td className="p-4 text-sm text-slate-400">
                        <span className={isOverdue ? 'text-red-400 font-medium flex items-center' : ''}>
                          {isOverdue && <AlertCircle className="h-4 w-4 mr-1" />}
                          {inst.dueDate}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-cyan-400 text-right">{inst.amount.toLocaleString()}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          inst.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                          isOverdue ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {inst.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        {inst.status !== 'paid' ? (
                          <button 
                            onClick={() => updateInstallmentStatus(inst.id, 'paid')}
                            className="text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Collect
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">Paid on {inst.paidDate}</span>
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
    </motion.div>
  );
}
