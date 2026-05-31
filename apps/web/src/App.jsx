import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ModulesPage from './pages/ModulesPage.jsx';
import ModuleDetailPage from './pages/ModuleDetailPage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import EvaluationPage from './pages/EvaluationPage.jsx';
import MyEvaluationsPage from './pages/MyEvaluationsPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SponsorPanelPage from './pages/SponsorPanelPage.jsx';
import CertificatePage from './pages/CertificatePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { Toaster } from 'sonner';

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/modules"   element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
          <Route path="/module/:moduleId" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
          <Route path="/lesson/:moduleId/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
          <Route path="/evaluation/:moduleId" element={<ProtectedRoute><EvaluationPage /></ProtectedRoute>} />
          <Route path="/evaluations" element={<ProtectedRoute><MyEvaluationsPage /></ProtectedRoute>} />
          <Route path="/resources"   element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/events"      element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/certificate" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
          <Route path="/sponsor-panel" element={<ProtectedRoute sponsorOnly><SponsorPanelPage /></ProtectedRoute>} />
          <Route path="/admin"       element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
