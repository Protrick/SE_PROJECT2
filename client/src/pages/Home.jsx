import React, { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppContext } from '../context/AppContext'

const Home = () => {
  const { userdata } = useContext(AppContext);

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Userdata:', userdata);
  }, [userdata]);

  return (
    <div className="app-bg page min-h-screen flex items-center justify-center">
      <div className="container">
        <motion.div
          className="card text-center max-w-3xl mx-auto p-8 shadow-2xl border-0"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateY: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            rotateY: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {userdata ? `Welcome, ${userdata.name}` : "Welcome USER"}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            {userdata ? "Here's your dashboard overview." : "Join or create teams to collaborate on projects and bring your ideas to life."}
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          >
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
