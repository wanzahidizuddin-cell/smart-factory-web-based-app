import { useEffect, useState } from 'react'
import supabase from './supabaseClient.js'
import './InventoryList.css'

function InventoryList() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadInventory() {
      try {
        const { data, error: queryError } = await supabase
          .from('inventory_items')
          .select('*')
          .order('sku')

        if (!active) return

        if (queryError) {
          setError(queryError.message)
        } else {
          setMaterials(data ?? [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInventory()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="inventory-list">
      <div className="inventory-list-heading">
        <div>
          <h2>Material inventory</h2>
          <p>Current stock levels and warehouse locations.</p>
        </div>
        <span className="inventory-list-count">
          {loading ? 'Loading inventory...' : `${materials.length} materials`}
        </span>
      </div>

      <div className="inventory-table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th scope="col">Material name</th>
              <th scope="col">Material code</th>
              <th scope="col">Rack location</th>
              <th scope="col">Current quantity</th>
              <th scope="col">Unit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading inventory...</td></tr>
            ) : error ? (
              <tr><td colSpan="5" role="alert">Unable to load inventory: {error}</td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan="5">No inventory items found.</td></tr>
            ) : materials.map((material) => {
              return (
              <tr key={material.sku}>
                <td className="inventory-material-name">{material.name}</td>
                <td className="inventory-material-code">{material.sku}</td>
                <td>{material.rack_location}</td>
                <td className="inventory-quantity">
                  {Number(material.current_quantity).toLocaleString()}
                </td>
                <td>{material.unit}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default InventoryList
