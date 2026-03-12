/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './store/MockDatabaseContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Savings from './pages/Savings';
import Loans from './pages/Loans';
import Installments from './pages/Installments';
import DayBook from './pages/DayBook';
import Reports from './pages/Reports';
import Staff from './pages/Staff';

export default function App() {
  return (
    <DatabaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="savings" element={<Savings />} />
            <Route path="loans" element={<Loans />} />
            <Route path="installments" element={<Installments />} />
            <Route path="daybook" element={<DayBook />} />
            <Route path="reports" element={<Reports />} />
            <Route path="staff" element={<Staff />} />
          </Route>
        </Routes>
      </Router>
    </DatabaseProvider>
  );
}
