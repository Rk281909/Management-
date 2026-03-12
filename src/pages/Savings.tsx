import React, { useState } from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { ArrowDownCircle, ArrowUpCircle, History, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Savings() {
  const { savingsAccounts, customers, addSavingsTransaction } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean, type: 'deposit' | 'withdraw', accountId: string | null }>({ isOpen: false, type: 'deposit', accountId: null });

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  const filteredAccounts = savingsAccounts.filter(acc => 
    acc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(acc.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const description = formData.get('description') as string;
    
    if (transactionModal.accountId) {
      addSavingsTransaction({
        accountId: transactionModal.accountId,
        type: transactionModal.type,
        amount,
        description,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setTransactionModal({ isOpen: false, type: 'deposit', accountId: null });
  };

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
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">Savings Management</motion.h1>
      </div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="glass-panel p-4 rounded-xl flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search by Account ID or Customer Name..." 
          className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Accounts List */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium">Account ID</th>
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Opened Date</th>
                <th className="p-4 font-medium text-right">Balance (Rs.)</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredAccounts.map(account => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={account.id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-slate-300">{account.id}</td>
                    <td className="p-4 text-sm text-slate-200">{getCustomerName(account.customerId)}</td>
                    <td className="p-4 text-sm text-slate-400">{account.openedDate}</td>
                    <td className="p-4 text-sm font-bold text-emerald-400 text-right">{account.balance.toLocaleString()}</td>
                    <td className="p-4 text-sm text-center space-x-2">
                      <button 
                        onClick={() => setTransactionModal({ isOpen: true, type: 'deposit', accountId: account.id })}
                        className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-500/10 rounded-lg px-3 border border-emerald-500/20 transition-colors" title="Deposit"
                      >
                        <ArrowDownCircle className="h-4 w-4 inline mr-1" /> Deposit
                      </button>
                      <button 
                        onClick={() => setTransactionModal({ isOpen: true, type: 'withdraw', accountId: account.id })}
                        className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/10 rounded-lg px-3 border border-red-500/20 transition-colors" title="Withdraw"
                      >
                        <ArrowUpCircle className="h-4 w-4 inline mr-1" /> Withdraw
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 p-1.5 bg-blue-500/10 rounded-lg px-3 border border-blue-500/20 transition-colors" title="History">
                        <History className="h-4 w-4 inline mr-1" /> History
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No savings accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {transactionModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${transactionModal.type === 'deposit' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-xl font-bold text-white capitalize">{transactionModal.type} Funds</h2>
                <button onClick={() => setTransactionModal({ isOpen: false, type: 'deposit', accountId: null })} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-6 relative z-10">Account: <span className="text-white">{transactionModal.accountId}</span> - {getCustomerName(savingsAccounts.find(a => a.id === transactionModal.accountId)?.customerId || '')}</p>
              
              <form className="space-y-4 relative z-10" onSubmit={handleTransaction}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount (Rs.)</label>
                  <input name="amount" required type="number" min="1" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <input name="description" required type="text" placeholder="e.g., Cash deposit" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => setTransactionModal({ isOpen: false, type: 'deposit', accountId: null })} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className={`px-4 py-2 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] ${transactionModal.type === 'deposit' ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50'}`}>
                    Confirm {transactionModal.type}
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
