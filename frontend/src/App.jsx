import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PacketsPage from './pages/PacketsPage';
import ThreatsPage from './pages/ThreatsPage';
import AttacksPage from './pages/AttacksPage';
import FirewallPage from './pages/FirewallPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/packets" element={<PacketsPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/attacks" element={<AttacksPage />} />
          <Route path="/firewall" element={<FirewallPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
