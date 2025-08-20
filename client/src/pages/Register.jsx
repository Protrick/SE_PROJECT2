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
    <div className='min-h-screen flex items-center justify-center'>
      <form onSubmit={onSubmit} className='bg-white/10 backdrop-blur-md p-8 rounded-lg w-full max-w-md flex flex-col gap-4'>
        <h2 className='text-2xl text-white'>Create an account</h2>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder='Name' className='p-2 rounded' />
        <input required type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' className='p-2 rounded' />
        <input required type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' className='p-2 rounded' />
        <button type='submit' className='bg-amber-500 text-white py-2 rounded'>Register</button>
      </form>
    </div>
  )
}

export default Register
