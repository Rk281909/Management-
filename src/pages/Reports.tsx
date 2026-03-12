import React from 'react';
import { useDatabase } from '../store/MockDatabaseContext';
import { FileText, Download, TrendingUp, PiggyBank, Landmark, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const { savingsAccounts, loans, installments, dayBook } = useDatabase();

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLoansIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOutstanding = loans.filter(l => l.status === 'active').reduce((sum, loan) => sum + loan.remainingBalance, 0);
  
  const overdueInstallments = installments.filter(i => i.status === 'pending' && new Date(i.dueDate) < new Date());
  const totalOverdueAmount = overdueInstallments.reduce((sum, i) => sum + i.amount, 0);

  const generatePDF = (reportType: string) => {
    const doc = new jsPDF();
    const today = new Date().toISOString().split('T')[0];
    
    doc.setFontSize(18);
    doc.text(`Microfinance System - ${reportType}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 30);

    if (reportType === 'Daily Transaction Report') {
      const todayTx = dayBook.filter(d => d.date === today);
      autoTable(doc, {
        startY: 40,
        head: [['ID', 'Type', 'Category', 'Amount (Rs.)', 'Description']],
        body: todayTx.map(tx => [tx.id, tx.type === 'cashIn' ? 'Cash In' : 'Cash Out', tx.category, tx.amount.toLocaleString(), tx.description]),
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212] }
      });
    } else if (reportType === 'Monthly Savings Report') {
      autoTable(doc, {
        startY: 40,
        head: [['Account ID', 'Customer ID', 'Opened Date', 'Balance (Rs.)', 'Status']],
        body: savingsAccounts.map(acc => [acc.id, acc.customerId, acc.openedDate, acc.balance.toLocaleString(), acc.status]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
    } else if (reportType === 'Loan Outstanding Report') {
      const activeLoans = loans.filter(l => l.status === 'active');
      autoTable(doc, {
        startY: 40,
        head: [['Loan ID', 'Customer ID', 'Total Amount', 'Remaining Balance', 'Interest Rate']],
        body: activeLoans.map(l => [l.id, l.customerId, l.amount.toLocaleString(), l.remainingBalance.toLocaleString(), `${l.interestRate}%`]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      });
    } else if (reportType === 'Collection Performance') {
      autoTable(doc, {
        startY: 40,
        head: [['Installment ID', 'Loan ID', 'Due Date', 'Amount', 'Status']],
        body: installments.map(i => [i.id, i.loanId, i.dueDate, i.amount.toLocaleString(), i.status]),
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] }
      });
    }

    doc.save(`${reportType.replace(/\s+/g, '_')}_${today}.pdf`);
  };

  const reportCards = [
    { title: 'Daily Transaction Report', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', desc: 'Summary of all cash in and cash out for today.' },
    { title: 'Monthly Savings Report', icon: PiggyBank, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Detailed view of savings deposits and withdrawals.' },
    { title: 'Loan Outstanding Report', icon: Landmark, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'List of all active loans and remaining balances.' },
    { title: 'Collection Performance', icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', desc: 'Analysis of EMI collections vs due amounts.' },
  ];

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
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white tracking-tight">Financial Reports</motion.h1>
      </div>

      {/* Quick Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Savings Portfolio</p>
          <p className="text-xl font-bold text-emerald-400">Rs. {totalSavings.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Loans Disbursed</p>
          <p className="text-xl font-bold text-purple-400">Rs. {totalLoansIssued.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Outstanding</p>
          <p className="text-xl font-bold text-cyan-400">Rs. {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 mb-1 flex items-center"><AlertTriangle className="h-4 w-4 mr-1" /> Total Overdue</p>
          <p className="text-xl font-bold text-red-500">Rs. {totalOverdueAmount.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Report Types */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/5 transition-colors group">
            <div className="flex items-start mb-4 sm:mb-0">
              <div className={`p-3 rounded-xl ${report.bg} border ${report.border} mr-4`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{report.desc}</p>
              </div>
            </div>
            <button 
              onClick={() => generatePDF(report.title)}
              className="flex items-center px-4 py-2 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white border border-white/10 text-sm font-medium transition-colors w-full sm:w-auto justify-center group-hover:border-cyan-500/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        ))}
      </motion.div>

      {/* Recent Activity Log Placeholder */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">System Activity Log</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-slate-200">Report Generated: Daily Transaction</p>
              <p className="text-xs text-slate-500">Today, 10:45 AM by Admin User</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-2 w-2 mt-2 rounded-full bg-cyan-500 mr-3 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-slate-200">Loan L001 Disbursed</p>
              <p className="text-xs text-slate-500">Yesterday, 14:30 PM by Manager User</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="h-2 w-2 mt-2 rounded-full bg-purple-500 mr-3 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-slate-200">New Customer C004 Added</p>
              <p className="text-xs text-slate-500">Yesterday, 09:15 AM by Staff User</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
