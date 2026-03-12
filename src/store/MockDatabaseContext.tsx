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
};

export type Installment = {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
};

export type DayBookEntry = {
  id: string;
  date: string;
  type: 'cashIn' | 'cashOut';
  category: string;
  amount: number;
  description: string;
};

export type Staff = {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  status: 'active' | 'inactive';
};

// Initial Mock Data
const initialCustomers: Customer[] = [
  { id: 'C001', name: 'Ram Bahadur Thapa', phone: '9841234567', address: 'Kathmandu, Nepal', citizenshipNo: '123-456-789', status: 'active', joinedDate: '2023-01-15' },
  { id: 'C002', name: 'Sita Sharma', phone: '9801234567', address: 'Pokhara, Nepal', citizenshipNo: '987-654-321', status: 'active', joinedDate: '2023-02-20' },
  { id: 'C003', name: 'Hari Prasad Gurung', phone: '9851234567', address: 'Chitwan, Nepal', citizenshipNo: '456-789-123', status: 'active', joinedDate: '2023-03-10' },
];

const initialSavingsAccounts: SavingsAccount[] = [
  { id: 'SA001', customerId: 'C001', balance: 50000, status: 'active', openedDate: '2023-01-15' },
  { id: 'SA002', customerId: 'C002', balance: 25000, status: 'active', openedDate: '2023-02-20' },
];

const initialLoans: Loan[] = [
  { id: 'L001', customerId: 'C003', amount: 100000, interestRate: 12, durationMonths: 12, status: 'active', remainingBalance: 80000, appliedDate: '2023-04-01', approvedDate: '2023-04-05' },
  { id: 'L002', customerId: 'C001', amount: 50000, interestRate: 10, durationMonths: 6, status: 'pending', remainingBalance: 50000, appliedDate: '2023-10-01' },
];

const initialInstallments: Installment[] = [
  { id: 'I001', loanId: 'L001', amount: 10000, dueDate: '2023-05-05', status: 'paid', paidDate: '2023-05-04' },
  { id: 'I002', loanId: 'L001', amount: 10000, dueDate: '2023-06-05', status: 'paid', paidDate: '2023-06-05' },
  { id: 'I003', loanId: 'L001', amount: 10000, dueDate: '2023-07-05', status: 'pending' },
];

const initialDayBook: DayBookEntry[] = [
  { id: 'DB001', date: new Date().toISOString().split('T')[0], type: 'cashIn', category: 'Saving Deposit', amount: 5000, description: 'Deposit by Ram' },
  { id: 'DB002', date: new Date().toISOString().split('T')[0], type: 'cashOut', category: 'Office Expenses', amount: 1500, description: 'Stationery' },
];

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
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addSavingsAccount: (account: Omit<SavingsAccount, 'id'>) => void;
  addSavingsTransaction: (transaction: Omit<SavingsTransaction, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoanStatus: (id: string, status: Loan['status']) => void;
  addInstallment: (installment: Omit<Installment, 'id'>) => void;
  updateInstallmentStatus: (id: string, status: Installment['status']) => void;
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

  const generateId = (prefix: string, list: any[]) => `${prefix}${(list.length + 1).toString().padStart(3, '0')}`;

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    setCustomers([...customers, { ...customer, id: generateId('C', customers) }]);
  };

  const updateCustomer = (id: string, updatedCustomer: Partial<Customer>) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
  };

  const addSavingsAccount = (account: Omit<SavingsAccount, 'id'>) => {
    setSavingsAccounts([...savingsAccounts, { ...account, id: generateId('SA', savingsAccounts) }]);
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
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    setLoans([...loans, { ...loan, id: generateId('L', loans) }]);
  };

  const updateLoanStatus = (id: string, status: Loan['status']) => {
    setLoans(loans.map(l => {
      if (l.id === id) {
        return { ...l, status, approvedDate: status === 'approved' ? new Date().toISOString().split('T')[0] : l.approvedDate };
      }
      return l;
    }));
  };

  const addInstallment = (installment: Omit<Installment, 'id'>) => {
    setInstallments([...installments, { ...installment, id: generateId('I', installments) }]);
  };

  const updateInstallmentStatus = (id: string, status: Installment['status']) => {
    setInstallments(installments.map(i => {
      if (i.id === id) {
        const updated = { ...i, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined };
        
        // Update loan remaining balance if paid
        if (status === 'paid' && i.status !== 'paid') {
          setLoans(currentLoans => currentLoans.map(l => 
            l.id === i.loanId ? { ...l, remainingBalance: Math.max(0, l.remainingBalance - i.amount) } : l
          ));
        }
        return updated;
      }
      return i;
    }));
  };

  const addDayBookEntry = (entry: Omit<DayBookEntry, 'id'>) => {
    setDayBook([...dayBook, { ...entry, id: generateId('DB', dayBook) }]);
  };

  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    setStaff([...staff, { ...newStaff, id: generateId('S', staff) }]);
  };

  const updateStaff = (id: string, updatedStaff: Partial<Staff>) => {
    setStaff(staff.map(s => s.id === id ? { ...s, ...updatedStaff } : s));
  };

  return (
    <DatabaseContext.Provider value={{
      customers, savingsAccounts, savingsTransactions, loans, installments, dayBook, staff,
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
