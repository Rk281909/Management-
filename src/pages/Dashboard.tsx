import React from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { Users, PiggyBank, Landmark, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { customers, savingsAccounts, loans, installments, dayBook } = useDatabase();

  const totalCustomers = customers.length;
  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLoansIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayCollection = dayBook
    .filter(entry => entry.date === today && entry.type === 'cashIn')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const dueInstallments = installments.filter(i => i.status === 'pending' && new Date(i.dueDate) <= new Date());

  const recentTransactions = dayBook.slice(-5).reverse();

  // Mock data for charts
  const monthlyData = [
    { name: 'Jan', savings: 40000, loans: 24000 },
    { name: 'Feb', savings: 30000, loans: 13980 },
    { name: 'Mar', savings: 20000, loans: 9800 },
    { name: 'Apr', savings: 27800, loans: 3908 },
    { name: 'May', savings: 18900, loans: 4800 },
    { name: 'Jun', savings: 23900, loans: 3800 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">System Overview</motion.h1>
      
      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={totalCustomers.toString()} 
          icon={<Users className="h-6 w-6 text-cyan-400" />} 
          glowColor="rgba(6,182,212,0.2)"
        />
        <StatCard 
          title="Total Savings" 
          value={`Rs. ${totalSavings.toLocaleString()}`} 
          icon={<PiggyBank className="h-6 w-6 text-emerald-400" />} 
          glowColor="rgba(16,185,129,0.2)"
        />
        <StatCard 
          title="Total Loans Issued" 
          value={`Rs. ${totalLoansIssued.toLocaleString()}`} 
          icon={<Landmark className="h-6 w-6 text-purple-400" />} 
          glowColor="rgba(139,92,246,0.2)"
        />
        <StatCard 
          title="Today's Collection" 
          value={`Rs. ${todayCollection.toLocaleString()}`} 
          icon={<TrendingUp className="h-6 w-6 text-orange-400" />} 
          glowColor="rgba(249,115,22,0.2)"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <span className="h-2 w-2 rounded-full bg-cyan-500 mr-2 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            Savings vs Loans (Monthly)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} name="Savings" />
                <Bar dataKey="loans" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Loans" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts & Recent */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                Due Alerts
              </h2>
              <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                {dueInstallments.length}
              </span>
            </div>
            <div className="space-y-3 relative z-10">
              {dueInstallments.length > 0 ? (
                dueInstallments.slice(0, 3).map(inst => (
                  <div key={inst.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Loan {inst.loanId}</p>
                      <p className="text-xs text-slate-400">Due: {inst.dueDate}</p>
                    </div>
                    <span className="text-sm font-bold text-red-400">Rs. {inst.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No pending dues.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="flex items-center mb-4 relative z-10">
              <Clock className="h-5 w-5 text-cyan-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            </div>
            <div className="space-y-4 relative z-10">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tx.category}</p>
                    <p className="text-xs text-slate-400">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'cashIn' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'cashIn' ? '+' : '-'} Rs. {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, glowColor }: { title: string, value: string, icon: React.ReactNode, glowColor: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] transition-opacity duration-500 opacity-50 group-hover:opacity-100"
        style={{ backgroundColor: glowColor }}
      />
      <div className="relative z-10 flex items-center">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
