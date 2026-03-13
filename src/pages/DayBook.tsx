import React, { useState } from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { Plus, ArrowDownRight, ArrowUpRight, Calendar, X, User, CreditCard, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DayBook() {
  const { dayBook, addDayBookEntry, customers, staff, currentStaffId } = useDatabase();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'cashIn' | 'cashOut'>('cashIn');

  const filteredEntries = dayBook.filter(entry => entry.date === selectedDate);

  const totalCashIn = filteredEntries.filter(e => e.type === 'cashIn').reduce((sum, e) => sum + e.amount, 0);
  const totalCashOut = filteredEntries.filter(e => e.type === 'cashOut').reduce((sum, e) => sum + e.amount, 0);
  // Mock opening balance for demo
  const openingBalance = 150000; 
  const closingBalance = openingBalance + totalCashIn - totalCashOut;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return '-';
    const s = staff.find(s => s.id === staffId);
    return s ? s.name : 'Unknown';
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">Day Book</motion.h1>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <button 
            onClick={() => { setEntryType('cashIn'); setIsAddModalOpen(true); }}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Plus className="h-4 w-4 mr-1" /> Cash In
          </button>
          <button 
            onClick={() => { setEntryType('cashOut'); setIsAddModalOpen(true); }}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <Plus className="h-4 w-4 mr-1" /> Cash Out
          </button>
        </motion.div>
      </div>

      {/* Daily Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-sm text-slate-400 mb-1">Opening Balance</p>
          <p className="text-2xl font-bold text-white">Rs. {openingBalance.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 blur-[30px] rounded-full pointer-events-none" />
          <p className="text-sm text-emerald-400 mb-1 flex items-center relative z-10"><ArrowDownRight className="h-4 w-4 mr-1" /> Total Cash In</p>
          <p className="text-2xl font-bold text-emerald-300 relative z-10">Rs. {totalCashIn.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-red-500/30 bg-red-500/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-[30px] rounded-full pointer-events-none" />
          <p className="text-sm text-red-400 mb-1 flex items-center relative z-10"><ArrowUpRight className="h-4 w-4 mr-1" /> Total Cash Out</p>
          <p className="text-2xl font-bold text-red-300 relative z-10">Rs. {totalCashOut.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/20 blur-[30px] rounded-full pointer-events-none" />
          <p className="text-sm text-cyan-400 mb-1 relative z-10">Closing Balance</p>
          <p className="text-2xl font-bold text-cyan-300 relative z-10">Rs. {closingBalance.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center">
          <Calendar className="h-5 w-5 text-cyan-400 mr-2" />
          <h2 className="font-semibold text-white">Transactions for {selectedDate}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-medium">Time/ID</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">Payment Info</th>
                <th className="p-4 font-medium text-right text-emerald-400">Cash In (Rs.)</th>
                <th className="p-4 font-medium text-right text-red-400">Cash Out (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredEntries.map(entry => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={entry.id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-300">{entry.id}</div>
                      <div className="text-xs text-slate-500 mt-1">{entry.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {entry.customerId && (
                          <div className="flex items-center text-xs text-cyan-400">
                            <User className="h-3 w-3 mr-1" />
                            {getCustomerName(entry.customerId)}
                          </div>
                        )}
                        <div className="text-sm text-slate-300">{entry.description}</div>
                        {entry.staffId && (
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/50 mr-1.5"></span>
                            By: {getStaffName(entry.staffId)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col gap-1">
                        {entry.paymentMethod && (
                          <div className="flex items-center text-xs text-slate-300">
                            <CreditCard className="h-3 w-3 mr-1 text-slate-400" />
                            {entry.paymentMethod}
                          </div>
                        )}
                        {entry.referenceNo && (
                          <div className="flex items-center text-xs text-slate-400">
                             <FileText className="h-3 w-3 mr-1" />
                             Ref: {entry.referenceNo}
                          </div>
                        )}
                        {!entry.paymentMethod && !entry.referenceNo && (
                          <span className="text-xs text-slate-600">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-emerald-400 text-right align-top">
                      {entry.type === 'cashIn' ? entry.amount.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-sm font-bold text-red-400 text-right align-top">
                      {entry.type === 'cashOut' ? entry.amount.toLocaleString() : '-'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No transactions recorded for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${entryType === 'cashIn' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white">Add {entryType === 'cashIn' ? 'Cash In' : 'Cash Out'} Entry</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form className="space-y-4 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addDayBookEntry({
                  date: selectedDate,
                  type: entryType,
                  category: formData.get('category') as string,
                  amount: Number(formData.get('amount')),
                  description: formData.get('description') as string,
                  paymentMethod: formData.get('paymentMethod') as 'Cash' | 'Check',
                  referenceNo: formData.get('referenceNo') as string,
                  staffId: currentStaffId
                });
                setIsAddModalOpen(false);
              }}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select name="category" required className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all [&>option]:bg-slate-900">
                    {entryType === 'cashIn' ? (
                      <>
                        <option value="Saving Deposit">Saving Deposit</option>
                        <option value="Loan Installment">Loan Installment</option>
                        <option value="Processing Fee">Processing Fee</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Loan Disbursement">Loan Disbursement</option>
                        <option value="Saving Withdrawal">Saving Withdrawal</option>
                        <option value="Office Expenses">Office Expenses</option>
                        <option value="Salary">Salary</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount (Rs.)</label>
                  <input name="amount" required type="number" min="1" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                    <select name="paymentMethod" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all [&>option]:bg-slate-900">
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reference No.</label>
                    <input name="referenceNo" type="text" placeholder="Check/Receipt No." className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <input name="description" required type="text" className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" />
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className={`px-4 py-2 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] ${entryType === 'cashIn' ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50'}`}>
                    Save Entry
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
