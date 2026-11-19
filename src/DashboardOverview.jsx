import { useEffect, useState } from 'react'
import supabase from './supabaseClient.js'
import './DashboardOverview.css'

function DashboardOverview() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOverview() {
      try {
        const [deliveriesResult, inventoryResult, inspectionsResult] = await Promise.all([
          supabase.from('deliveries').select('*'),
          supabase.from('inventory_items').select('*'),
          supabase.from('inspections').select('*'),
        ])

        if (!active) return

        const queryError = deliveriesResult.error
          ?? inventoryResult.error
          ?? inspectionsResult.error

        if (queryError) {
          setError(queryError.message)
        } else {
          const deliveries = deliveriesResult.data ?? []
          const inventory = inventoryResult.data ?? []
          const inspections = inspectionsResult.data ?? []
          const now = new Date()
          const passedThisMonth = inspections.filter((record) => {
            const date = new Date(record.recorded_at ?? record.created_at)
            return record.result === 'Pass'
              && !Number.isNaN(date.getTime())
              && date.getMonth() === now.getMonth()
              && date.getFullYear() === now.getFullYear()
          }).length
          const stockTotal = inventory.reduce((total, item) => {
            const quantity = Number(item.current_quantity ?? 0)
            return total + (Number.isFinite(quantity) ? quantity : 0)
          }, 0)

          setMetrics([
            {
              label: 'Total Deliveries',
              value: deliveries.length.toLocaleString(),
              detail: 'Across all suppliers',
              tone: 'blue',
            },
            {
              label: 'Quarantined Batches',
              value: deliveries.filter(
                (delivery) => delivery.status === 'Quarantined',
              ).length.toLocaleString(),
              detail: 'Awaiting quality review',
              tone: 'amber',
            },
            {
              label: 'Passed Inspections',
              value: passedThisMonth.toLocaleString(),
              detail: 'This month',
              tone: 'green',
            },
            {
              label: 'Total Inventory Stock',
              value: stockTotal.toLocaleString(),
              detail: 'Units on hand',
              tone: 'purple',
            },
          ])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOverview()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="dashboard-overview" aria-label="Factory overview">
      <div className="dashboard-overview-heading">
        <h2>Factory overview</h2>
        <p>A snapshot of your delivery, quality, and inventory activity.</p>
      </div>

      {error && <p role="alert">Unable to load factory overview: {error}</p>}
      <div className="dashboard-metrics" aria-busy={loading}>
        {loading && <p>Loading factory overview...</p>}
        {metrics.map((metric) => (
          <article
            className={`dashboard-metric dashboard-metric--${metric.tone}`}
            key={metric.label}
          >
            <p className="dashboard-metric-label">{metric.label}</p>
            <p className="dashboard-metric-value">{metric.value}</p>
            <p className="dashboard-metric-detail">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardOverview
