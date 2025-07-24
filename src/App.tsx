import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Accounts } from './pages/Accounts'
import { Categories } from './pages/Categories'
import { Reports } from './pages/Reports'
import { Calendar } from './pages/Calendar'
import { Budgets } from './pages/Budgets'
import { Settings } from './pages/Settings'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

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
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/*" element={
        user ? (
          <Layout>
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
          </Layout>
        ) : (
          <Navigate to="/auth" replace />
        )
      } />
    </Routes>
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
              className: 'shadow-lg font-medium',
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