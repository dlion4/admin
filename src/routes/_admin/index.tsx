import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_admin/')({
  component: AdminIndex,
})

function AdminIndex() {
  const navigate = useNavigate()

  // Redirect to /dashboard when user visits /
  useEffect(() => {
    navigate({ to: '/dashboard', replace: true })
  }, [navigate])

  return null
}
