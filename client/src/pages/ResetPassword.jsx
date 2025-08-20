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
    <div className='min-h-screen flex items-center justify-center'>
      <div className='bg-white/10 backdrop-blur-md p-8 rounded-lg w-full max-w-md'>
        {step === 1 ? (
          <form onSubmit={requestOtp} className='flex flex-col gap-4'>
            <h2 className='text-xl'>Forgot password</h2>
            <input type='email' placeholder='Email' required value={email} onChange={e => setEmail(e.target.value)} className='p-2 rounded outline-2' />
            <button className='bg-blue-600 text-white py-2 rounded'>Send OTP</button>
          </form>
        ) : (
          <form onSubmit={submitReset} className='flex flex-col gap-4'>
            <h2 className='text-xl'>Reset password</h2>
              <input type='text' placeholder='OTP' required value={otp} onChange={e => setOtp(e.target.value)} className='p-2 rounded outline-2' />
              <input type='password' placeholder='New password' required value={newPassword} onChange={e => setNewPassword(e.target.value)} className='p-2 rounded outline-2' />
            <div className='flex gap-2'>
              <button className='bg-green-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-green-700' type='submit'>Reset Password</button>
                <button className='bg-gray-500 cursor-pointer hover:bg-gray-700 text-white py-2 px-4 rounded' type='button' onClick={() => setStep(1)}>Back</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
