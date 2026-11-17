import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TransactionModal from './components/TransactionModal';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Recurring from './pages/Recurring';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

function ProtectedLayout({ children, onOpenAdd, onEditTransaction }) {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fintech-dark text-slate-300 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span>Initializing SmartTrack AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-fintech-dark text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddTransactionClick={onOpenAdd}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Dashboard key={refreshKey} onOpenAddTransaction={handleOpenAdd} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Transactions key={refreshKey} onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Budgets key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Analytics key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Goals key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/recurring"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Recurring key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <AIAssistant key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Reports key={refreshKey} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout onOpenAdd={handleOpenAdd} onEditTransaction={handleEdit}>
              <Profile key={refreshKey} />
            </ProtectedLayout>
          }
        />

        {/* Default fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={editingTransaction}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
