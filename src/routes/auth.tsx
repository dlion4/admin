import { useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthenticationPage } from '../authentication/page/AuthenticationPage'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const handleNavigate = useCallback(
    (id: string) => {
      navigate({ to: `/${id}` })
    },
    [navigate],
  )

  return (
    <AuthenticationPage
      signal={{ action: '', n: 0 }}
      onNavigate={handleNavigate}
    />
  )
}
