import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  citizenshipNo: string;
  status: 'active' | 'inactive';
  joinedDate: string;
};

export type SavingsAccount = {
  id: string;
  customerId: string;
  balance: number;
  status: 'active' | 'closed';
  openedDate: string;
};

export type SavingsTransaction = {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'Cash' | 'Check';
  referenceNo?: string;
  staffId: string;
};

export type Loan = {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  status: 'pending' | 'approved' | 'active' | 'closed' | 'rejected';
  remainingBalance: number;
  appliedDate: string;
  approvedDate?: string;
  staffId?: string;
};

export type Installment = {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paymentMethod?: 'Cash' | 'Check';
  referenceNo?: string;
  staffId?: string;
};

export type DayBookEntry = {
  id: string;
  date: string;
  type: 'cashIn' | 'cashOut';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'Cash' | 'Check';
  referenceNo?: string;
  staffId: string;
  customerId?: string;
};

export type Staff = {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  status: 'active' | 'inactive';
};

// Initial Mock Data
const initialCustomers: Customer[] = [];

const initialSavingsAccounts: SavingsAccount[] = [];

const initialLoans: Loan[] = [];

const initialInstallments: Installment[] = [];

const initialDayBook: DayBookEntry[] = [];

const initialStaff: Staff[] = [
  { id: 'S001', name: 'Admin User', role: 'Admin', status: 'active' },
  { id: 'S002', name: 'Manager User', role: 'Manager', status: 'active' },
  { id: 'S003', name: 'Staff User', role: 'Staff', status: 'active' },
];

// Context Definition
type DatabaseContextType = {
  customers: Customer[];
  savingsAccounts: SavingsAccount[];
  savingsTransactions: SavingsTransaction[];
  loans: Loan[];
  installments: Installment[];
  dayBook: DayBookEntry[];
  staff: Staff[];
  currentStaffId: string;
  setCurrentStaffId: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addSavingsAccount: (account: Omit<SavingsAccount, 'id'>) => void;
  addSavingsTransaction: (transaction: Omit<SavingsTransaction, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoanStatus: (id: string, status: Loan['status'], staffId?: string) => void;
  addInstallment: (installment: Omit<Installment, 'id'>) => void;
  updateInstallmentStatus: (id: string, status: Installment['status'], paymentDetails?: { paymentMethod: 'Cash'|'Check', referenceNo?: string, staffId: string }) => void;
  addDayBookEntry: (entry: Omit<DayBookEntry, 'id'>) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>(initialSavingsAccounts);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [dayBook, setDayBook] = useState<DayBookEntry[]>(initialDayBook);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [currentStaffId, setCurrentStaffId] = useState<string>('S001'); // Default to Admin

  const generateId = (prefix: string, list: any[]) => `${prefix}${(list.length + 1).toString().padStart(3, '0')}`;

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newId = generateId('C', customers);
    const newCustomer = { ...customer, id: newId };
    setCustomers(prev => [...prev, newCustomer]);
    // Auto-create a savings account for new customer
    addSavingsAccount({ customerId: newId, balance: 0, status: 'active', openedDate: newCustomer.joinedDate });
  };

  const updateCustomer = (id: string, updatedCustomer: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
  };

  const addSavingsAccount = (account: Omit<SavingsAccount, 'id'>) => {
    setSavingsAccounts(prev => [...prev, { ...account, id: generateId('SA', prev) }]);
  };

  const addSavingsTransaction = (transaction: Omit<SavingsTransaction, 'id'>) => {
    const newTransaction = { ...transaction, id: generateId('ST', savingsTransactions) };
    setSavingsTransactions([...savingsTransactions, newTransaction]);
    
    // Update account balance
    setSavingsAccounts(accounts => accounts.map(acc => {
      if (acc.id === transaction.accountId) {
        return {
          ...acc,
          balance: transaction.type === 'deposit' 
            ? acc.balance + transaction.amount 
            : acc.balance - transaction.amount
        };
      }
      return acc;
    }));

    // Auto-create DayBook entry
    const account = savingsAccounts.find(a => a.id === transaction.accountId);
    addDayBookEntry({
      date: transaction.date,
      type: transaction.type === 'deposit' ? 'cashIn' : 'cashOut',
      category: transaction.type === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal',
      amount: transaction.amount,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      referenceNo: transaction.referenceNo,
      staffId: transaction.staffId,
      customerId: account?.customerId
    });
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    setLoans([...loans, { ...loan, id: generateId('L', loans) }]);
  };

  const updateLoanStatus = (id: string, status: Loan['status'], staffId?: string) => {
    setLoans(loans.map(l => {
      if (l.id === id) {
        const updated = { ...l, status, approvedDate: status === 'approved' ? new Date().toISOString().split('T')[0] : l.approvedDate };
        
        // If loan is disbursed (active), add to DayBook
        if (status === 'active' && l.status !== 'active') {
          addDayBookEntry({
            date: new Date().toISOString().split('T')[0],
            type: 'cashOut',
            category: 'Loan Disbursement',
            amount: l.amount,
            description: `Loan disbursed for ${id}`,
            paymentMethod: 'Cash', // Defaulting to Cash for now
            staffId: staffId || currentStaffId,
            customerId: l.customerId
          });
        }
        return updated;
      }
      return l;
    }));
  };

  const addInstallment = (installment: Omit<Installment, 'id'>) => {
    setInstallments([...installments, { ...installment, id: generateId('I', installments) }]);
  };

  const updateInstallmentStatus = (id: string, status: Installment['status'], paymentDetails?: { paymentMethod: 'Cash'|'Check', referenceNo?: string, staffId: string }) => {
    setInstallments(installments.map(i => {
      if (i.id === id) {
        const updated = { 
          ...i, 
          status, 
          paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
          ...(paymentDetails || {})
        };
        
        // Update loan remaining balance if paid
        if (status === 'paid' && i.status !== 'paid') {
          const loan = loans.find(l => l.id === i.loanId);
          setLoans(currentLoans => currentLoans.map(l => 
            l.id === i.loanId ? { ...l, remainingBalance: Math.max(0, l.remainingBalance - i.amount) } : l
          ));

          // Auto-create DayBook entry
          addDayBookEntry({
            date: updated.paidDate!,
            type: 'cashIn',
            category: 'Loan Installment',
            amount: i.amount,
            description: `Installment collection for Loan ${i.loanId}`,
            paymentMethod: paymentDetails?.paymentMethod || 'Cash',
            referenceNo: paymentDetails?.referenceNo,
            staffId: paymentDetails?.staffId || currentStaffId,
            customerId: loan?.customerId
          });
        }
        return updated;
      }
      return i;
    }));
  };

  const addDayBookEntry = (entry: Omit<DayBookEntry, 'id'>) => {
    setDayBook(prev => [...prev, { ...entry, id: generateId('DB', prev) }]);
  };

  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    setStaff([...staff, { ...newStaff, id: generateId('S', staff) }]);
  };

  const updateStaff = (id: string, updatedStaff: Partial<Staff>) => {
    setStaff(staff.map(s => s.id === id ? { ...s, ...updatedStaff } : s));
  };

  return (
    <DatabaseContext.Provider value={{
      customers, savingsAccounts, savingsTransactions, loans, installments, dayBook, staff, currentStaffId, setCurrentStaffId,
      addCustomer, updateCustomer, addSavingsAccount, addSavingsTransaction, addLoan, updateLoanStatus, addInstallment, updateInstallmentStatus, addDayBookEntry, addStaff, updateStaff
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
