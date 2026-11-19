import { useEffect, useRef, useState } from 'react'
import './App.css'
import DashboardOverview from './DashboardOverview.jsx'
import DeliveriesList from './DeliveriesList.jsx'
import InventoryList from './InventoryList.jsx'
import LoginPage from './LoginPage.jsx'
import QcRecordsList from './QcRecordsList.jsx'
import supabase from './supabaseClient.js'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authError, setAuthError] = useState('')
  const authEventSeen = useRef(false)

  useEffect(() => {
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventSeen.current = true
      setSession(nextSession)
      setAuthError('')
      setInitializing(false)
    })

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!active) return

        if (error) {
          setAuthError(error.message)
        } else if (!authEventSeen.current) {
          setSession(data.session)
        }
      } catch (loadError) {
        if (active) {
          setAuthError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        if (active) setInitializing(false)
      }
    }

    loadSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    setAuthError('')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) setAuthError(error.message)
    } catch (signOutError) {
      setAuthError(signOutError instanceof Error ? signOutError.message : String(signOutError))
    }
  }

  if (initializing) {
    return <main className="auth-loading" aria-live="polite">Checking your session...</main>
  }

  if (!session) {
    return (
      <>
        {authError && <p className="auth-global-error" role="alert">{authError}</p>}
        <LoginPage />
      </>
    )
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <h2>Smart Factory</h2>
        <ul>
          <li onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li onClick={() => setActiveTab('inventory')}>Inventory</li>
          <li onClick={() => setActiveTab('deliveries')}>Deliveries</li>
          <li onClick={() => setActiveTab('qc')}>Quality Control</li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="content">
        <header>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-actions">
            <span className="user-profile">{session.user.email}</span>
            <button className="sign-out-button" onClick={handleSignOut} type="button">
              Sign Out
            </button>
          </div>
        </header>

        {authError && <p className="auth-global-error" role="alert">{authError}</p>}
        <div className="page-content">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'inventory' && <InventoryList />}
          {activeTab === 'deliveries' && <DeliveriesList />}
          {activeTab === 'qc' && <QcRecordsList />}
        </div>
      </main>
    </div>
  )
}

export default App