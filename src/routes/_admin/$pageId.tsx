import { createFileRoute } from '@tanstack/react-router'
import { ROUTE_REGISTRY } from '../../shell/routeRegistry'
import { useAdminPageContext } from '../_admin'

export const Route = createFileRoute('/_admin/$pageId')({
  component: AdminPage,
})

function AdminPage() {
  const { pageId } = Route.useParams()
  const { signal, onNavigate } = useAdminPageContext()
  const PageComponent = ROUTE_REGISTRY[pageId]

  if (!PageComponent) {
    return (
      <div className="pm-card pm-card-pad">
        <div className="pm-empty">
          <i className="bi bi-exclamation-triangle" />
          <div style={{ fontWeight: 700, color: 'var(--pm-ink)', marginTop: '.5rem' }}>
            Page not found
          </div>
          <div style={{ fontSize: '.8rem', marginTop: '.2rem' }}>
            The page &quot;{pageId}&quot; does not exist.
          </div>
        </div>
      </div>
    )
  }

  return <PageComponent signal={signal} onNavigate={onNavigate} />
}
