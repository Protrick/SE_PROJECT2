import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const ResetPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

  const requestOtp = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/sendResetOtp`, { email })
      if (data.success) {
        toast.success(data.message || 'OTP sent to email')
        setStep(2)
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Request failed')
    }
  }

  const submitReset = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/resetPassword`, { email, otp, newPassword })
      if (data.success) {
        toast.success(data.message || 'Password reset successful')
        navigate('/login')
      } else {
        toast.error(data.message || 'Reset failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Reset failed')
    }
  }

  return (
    <div className="app-bg page">
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          {step === 1 ? (
            <form onSubmit={requestOtp} className="col">
              <h2 className="h1">Forgot password</h2>
              <p className="text-muted mt-2">Enter your account email to receive a reset code.</p>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn btn-accent" type="submit">Send OTP</button>
              </div>
            </form>
          ) : (
            <form onSubmit={submitReset} className="col">
              <h2 className="h1">Reset password</h2>
              <p className="text-muted mt-2">Enter the OTP you received and set a new password.</p>
              <input
                type="text"
                placeholder="OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input"
              />
              <input
                type="password"
                placeholder="New password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <button className="btn btn-primary" type="button" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-accent" type="submit">Reset Password</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
