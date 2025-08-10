import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dash';
import ClientsPage from './pages/Clients';
import InvoicesPage from './pages/Invoices';
import SettingsPage from './pages/Settings';
import Layout from './components/Layout';
import './App.css';

function AppContent() {
  return (
    <Routes>
      {/* All routes now use Layout without authentication */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="invoice" element={<InvoicesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
