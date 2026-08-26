import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ToastHost } from '../components/ui'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ToastHost>
      <Outlet />
    </ToastHost>
  )
}
