import React from 'react'
import LoginForm from '@/components/auth/LoginForm'

function LoginPage() {
  if (localStorage.getItem('token')) {
    return <Navigate to="/" replace/>
  }
  return (
    <div className='login-page'>
      <LoginForm/>
    </div>
  )
}

export default LoginPage