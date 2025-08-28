import React, { useContext, useEffect } from 'react'

import { AppContext } from '../context/AppContext'

const Home = () => {
  const { userdata } = useContext(AppContext);

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Userdata:', userdata);
  }, [userdata]);

  return (
    <div className="app-bg page">
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 className="h1">{userdata ? `Welcome, ${userdata.name}` : "Welcome to SE_PROJECT2"}</h1>
          <p className="text-muted mt-2">{userdata ? "Here's your dashboard overview." : "Join or create teams to collaborate on projects."}</p>
        </div>
      </div>
    </div>
  )
}

export default Home
