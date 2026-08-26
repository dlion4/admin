import { createContext, useCallback, useContext, useState } from 'react'
import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { AdminShell, type ShellAction } from '../shell/AdminShell'
import type { PageSignal } from '../shell/routeRegistry'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
})

export type AdminPageContext = {
  signal: PageSignal
  onNavigate: (id: string) => void
}

const AdminPageContext = createContext<AdminPageContext>({
  signal: { action: '', n: 0 },
  onNavigate: () => {},
})

export function useAdminPageContext() {
  return useContext(AdminPageContext)
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [signal, setSignal] = useState<PageSignal>({ action: '', n: 0 })

  const handleNavigate = useCallback(
    (id: string) => {
      navigate({ to: `/${id}` })
    },
    [navigate],
  )

  const fire = useCallback((action: ShellAction) => {
    setSignal((s) => ({ action, n: s.n + 1 }))
  }, [])

  // Derive active page from URL: "/" → "dashboard", "/monitor" → "monitor"
  const pathSegment = location.pathname.replace(/^\//, '')
  const active = pathSegment || 'dashboard'

  return (
    <AdminPageContext.Provider value={{ signal, onNavigate: handleNavigate }}>
      <AdminShell active={active} onNavigate={handleNavigate} onPageAction={fire}>
        <Outlet />
      </AdminShell>
    </AdminPageContext.Provider>
  )
}
