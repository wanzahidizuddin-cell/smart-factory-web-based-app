import { useEffect, useState } from 'react'
import supabase from './supabaseClient.js'
import './DeliveriesList.css'

function DeliveriesList() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDeliveries() {
      try {
        const { data, error: queryError } = await supabase
          .from('deliveries')
          .select('*')

        if (!active) return

        if (queryError) {
          setError(queryError.message)
        } else {
          setDeliveries(data ?? [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDeliveries()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="deliveries">
      <div className="deliveries-heading">
        <div>
          <h2>Incoming deliveries</h2>
          <p>Track materials arriving at your facility.</p>
        </div>
        <span className="deliveries-count">
          {loading ? 'Loading deliveries...' : `${deliveries.length} deliveries`}
        </span>
      </div>

      <div className="deliveries-table-wrap">
        <table className="deliveries-table">
          <thead>
            <tr>
              <th scope="col">Batch number</th>
              <th scope="col">Supplier</th>
              <th scope="col">Material</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Loading deliveries...</td></tr>
            ) : error ? (
              <tr><td colSpan="4" role="alert">Unable to load deliveries: {error}</td></tr>
            ) : deliveries.length === 0 ? (
              <tr><td colSpan="4">No deliveries found.</td></tr>
            ) : deliveries.map((delivery) => {
              const status = delivery.status
              const statusTone = {
                Passed: 'received',
                Released: 'received',
                Quarantined: 'pending',
              }[status] ?? String(status).toLowerCase().replace(/\s+/g, '-')

              return (
              <tr key={delivery.batch_number}>
                <td className="batch-number">{delivery.batch_number}</td>
                <td>{delivery.supplier}</td>
                <td>{delivery.material}</td>
                <td>
                  <span
                    className={`delivery-status delivery-status--${statusTone}`}
                  >
                    {status}
                  </span>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DeliveriesList
