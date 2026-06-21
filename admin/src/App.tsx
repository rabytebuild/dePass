import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Layout } from "@/components/layout"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import EventsPage from "@/pages/events"
import EventPassesPage from "@/pages/event-passes"
import DevicesPage from "@/pages/devices"
import UsersPage from "@/pages/users"
import ConfigPage from "@/pages/config"
import QrWizardPage from "@/pages/qr-wizard"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route
        path="/events"
        element={
          <AuthGuard>
            <EventsPage />
          </AuthGuard>
        }
      />
      <Route
        path="/events/:id/passes"
        element={
          <AuthGuard>
            <EventPassesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/devices"
        element={
          <AuthGuard>
            <DevicesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/users"
        element={
          <AuthGuard>
            <UsersPage />
          </AuthGuard>
        }
      />
      <Route
        path="/config"
        element={
          <AuthGuard>
            <ConfigPage />
          </AuthGuard>
        }
      />
      <Route
        path="/qr-wizard"
        element={
          <AuthGuard>
            <QrWizardPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
