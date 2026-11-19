import { useEffect, useState } from 'react'
import supabase from './supabaseClient.js'
import './QcRecordsList.css'

function QcRecordsList() {
  const [qcRecords, setQcRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadQcRecords() {
      try {
        const { data, error: queryError } = await supabase
          .from('inspections')
          .select('*')
          .order('created_at', { ascending: false })

        if (!active) return

        if (queryError) {
          setError(queryError.message)
        } else {
          setQcRecords(data ?? [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadQcRecords()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="qc-records">
      <div className="qc-records-heading">
        <div>
          <h2>Quality inspection records</h2>
          <p>Review recent batch inspection results and notes.</p>
        </div>
        <span className="qc-records-count">
          {loading ? 'Loading records...' : `${qcRecords.length} records`}
        </span>
      </div>

      <div className="qc-table-wrap">
        <table className="qc-table">
          <thead>
            <tr>
              <th scope="col">Serial number</th>
              <th scope="col">Inspector</th>
              <th scope="col">Inspection date</th>
              <th scope="col">Result</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading inspection records...</td></tr>
            ) : error ? (
              <tr><td colSpan="5" role="alert">Unable to load inspection records: {error}</td></tr>
            ) : qcRecords.length === 0 ? (
              <tr><td colSpan="5">No inspection records found.</td></tr>
            ) : qcRecords.map((record) => {
              const result = record.result === 'Pass' ? 'Passed' : 'Failed'
              const inspectionDate = record.recorded_at ?? record.created_at
              const parsedDate = inspectionDate ? new Date(inspectionDate) : null
              const formattedDate = parsedDate && !Number.isNaN(parsedDate.getTime())
                ? parsedDate.toLocaleDateString()
                : inspectionDate ?? '—'
              return (
              <tr key={record.serial_number}>
                <td className="qc-batch-number">{record.serial_number}</td>
                <td>{record.inspector_id}</td>
                <td className="qc-inspection-date">{formattedDate}</td>
                <td>
                  <span
                    className={`qc-result qc-result--${String(result).toLowerCase()}`}
                  >
                    {result}
                  </span>
                </td>
                <td className="qc-notes">{record.notes}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default QcRecordsList
