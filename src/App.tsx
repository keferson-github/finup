import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { DashboardProvider } from './contexts/DashboardContext'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { DashboardSyncWrapper } from './components/dashboard/DashboardSyncWrapper'

// Lazy loading das páginas para code splitting
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })))
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Transactions = React.lazy(() => import('./pages/Transactions').then(module => ({ default: module.Transactions })))
const Accounts = React.lazy(() => import('./pages/Accounts').then(module => ({ default: module.Accounts })))
const Categories = React.lazy(() => import('./pages/Categories').then(module => ({ default: module.Categories })))
const Reports = React.lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })))
const Calendar = React.lazy(() => import('./pages/Calendar').then(module => ({ default: module.Calendar })))
const Budgets = React.lazy(() => import('./pages/Budgets').then(module => ({ default: module.Budgets })))
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={
          user ? (
            <DashboardProvider>
              <DashboardSyncWrapper>
                <Layout>
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="md" />
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/accounts" element={<Accounts />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/budgets" element={<Budgets />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </DashboardSyncWrapper>
            </DashboardProvider>
          ) : (
            <Navigate to="/auth" replace />
          )
        } />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'font-medium',
              style: {
              backgroundColor: '#0D1117',
              color: '#FAFAFA',
              borderRadius: '6px',
              padding: '20px',
              maxWidth: '450px',
              fontSize: '14px',
              minWidth: '300px',
                border: 'none',
              },
              success: {
                style: {
                  backgroundColor: '#0D1117',
                  color: '#FAFAFA',
                  borderRadius: '6px',
                },
                iconTheme: {
                  primary: '#2da44e',
                  secondary: '#0D1117',
                },
              },
              error: {
                style: {
                  backgroundColor: '#0D1117',
                  color: '#FAFAFA',
                  borderRadius: '6px',
                },
                iconTheme: {
                  primary: '#cf222e',
                  secondary: '#0D1117',
                },
              },
              loading: {
                style: {
                  backgroundColor: '#0D1117',
                  color: '#FAFAFA',
                  borderRadius: '6px',
                },
                iconTheme: {
                  primary: '#0969da',
                  secondary: '#0D1117',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App