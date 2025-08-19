import React, { useContext } from 'react'

import { AppContext } from '../context/AppContext'

const Home = () => {
  const { userdata } = useContext(AppContext);

  return (
    <div className="min-h-screen pt-20  flex items-center justify-center">
      <h1 className="text-black text-center text-3xl">
        {userdata ? `Welcome, ${userdata.name}` : "Welcome to the Home Page"}
      </h1>
    </div>
  )
}

export default Home