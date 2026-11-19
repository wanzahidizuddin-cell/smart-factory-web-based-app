import { useState } from 'react'
import supabase from './supabaseClient.js'
import './LoginPage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) setError(signInError.message)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : String(signInError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand-mark" aria-hidden="true">SF</div>
        <p className="login-eyebrow">SMART FACTORY</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-description">Sign in to manage your factory operations.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            autoComplete="email"
            id="login-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />

          <label htmlFor="login-password">Password</label>
          <input
            autoComplete="current-password"
            id="login-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-submit" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
