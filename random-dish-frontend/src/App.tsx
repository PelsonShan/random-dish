import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Layout } from '@/components/Layout'
import { SpaceListPage } from '@/pages/SpaceListPage'
import { SpaceHomePage } from '@/pages/SpaceHomePage'
import { DishListPage } from '@/pages/DishListPage'
import { MembersPage } from '@/pages/MembersPage'

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/spaces" element={<SpaceListPage />} />
              <Route path="/spaces/:id" element={<SpaceHomePage />} />
              <Route path="/spaces/:id/dishes" element={<DishListPage />} />
              <Route path="/spaces/:id/members" element={<MembersPage />} />
              <Route path="/" element={<Navigate to="/spaces" replace />} />
              <Route path="*" element={<Navigate to="/spaces" replace />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  )
}
