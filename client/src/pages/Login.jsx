import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setstate] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  return (

    <div className='flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-700 to-amber-400'>
      <div className='flex flex-col p-8 gap-y-4 justify-center items-center w-auto h-auto  rounded-lg shadow-lg backdrop-blur-lg'>
        <h1>{state === "signup" ? "create account" : "login"}</h1>
        <p>{state === "signup" ? "Please fill in the details to create an account." : "Please enter your credentials to log in."}</p>
        <form className='flex flex-col gap-y-4'>
          {state === "signup" ? (
            <>
              <input type="text" className='outline-none border-b-2 border-gray-300 focus:border-amber-500' placeholder="Name" required onChange={e=>setName(e.target.value)} value={name} />
              <input type="email" className='outline-none border-b-2 border-gray-300 focus:border-amber-500' placeholder="Email" required onChange={e=>setEmail(e.target.value)} value={email} />
              <input type="password" className='outline-none border-b-2 border-gray-300 focus:border-amber-500' placeholder="Password" required onChange={e=>setPassword(e.target.value)} value={password} />
              <button type="submit" className='bg-amber-500 text-white py-2 px-4 rounded-lg'  >Create Account</button>
              <p>already have an account?<span className='underline cursor-pointer text-blue-600' onClick={() => setstate("signin")}>Sign in</span></p>
            </>
          ) : (
            <>
              <input type="email" className='outline-none border-b-2 border-gray-300 focus:border-amber-500' placeholder="Email" required />
              <input type="password" className='outline-none border-b-2 border-gray-300 focus:border-amber-500' placeholder="Password" required />
                <p className='cursor-pointer underline text-blue-600' onClick={()=>navigate('/reset-password')}>forgot password?</p>
              <button type="submit" className='bg-amber-500 text-white py-2 px-4 rounded-lg'>Login</button>
                <p>Don't have an account? <span className='underline cursor-pointer text-blue-600' onClick={() => setstate("signup")}>Sign up</span></p>
            </>
          )}
        </form>
      </div>  
    </div>
  )
}

export default Login
