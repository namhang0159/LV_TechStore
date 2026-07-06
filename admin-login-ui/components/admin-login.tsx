'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/util/api'

export function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Demo credentials - Replace with real auth in production
  const ADMIN_EMAIL = 'admin@example.com'
  const ADMIN_PASSWORD = 'admin123'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await loginAdmin(email, password)
      const data = response.data

      if (data.success) {
        // Store session 
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.data.user))
        router.push('/dashboard')
      } else {
        setError(data.message || 'Invalid email or password')
        setPassword('')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Access the admin dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Keep me signed in
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded bg-blue-900 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Create Account'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot your password?
            </a>
          </div>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 rounded bg-gray-50 px-4 py-3 text-xs text-gray-600 border border-gray-200">
          <p className="font-semibold text-gray-700 mb-1">Demo Credentials:</p>
          <p>Email: <code>nam@gmail.com</code></p>
          <p>Password: <code>nam123</code></p>
        </div>
      </div>
    </div>
  )
}
