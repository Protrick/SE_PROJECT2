import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password }, { withCredentials: true })
      if (data.success) {
        toast.success(data.message || 'Registered successfully')
        setIsLoggedin(true)
        await getUserData()
        navigate('/')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration error')
    }
  }

  return (
    <div className="app-bg page">
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 className="h1">Create an account</h2>
          <p className="text-muted mt-2">Fill in the details to get started.</p>

          <form onSubmit={onSubmit} className="col mt-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="form-input"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="form-input"
            />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
            />
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button type="submit" className="btn btn-accent">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
