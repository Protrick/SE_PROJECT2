import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JoinTeam from './pages/JoinTeam.jsx'
import CreateTeam from './pages/CreateTeam.jsx'
import CreatedTeams from './pages/CreatedTeams.jsx'
import AppliedTeams from './pages/AppliedTeams.jsx'
import TeamDetails from './pages/TeamDetails.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import LiveOpeningCreatorView from './pages/LiveOpeningCreatorView.jsx'
import LiveOpeningJoiningView from './pages/LiveOpeningJoiningView.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <div className="app-bg min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />
            <Route path="/join-team" element={<JoinTeam />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/created-teams" element={<CreatedTeams />} />
            <Route path="/applied-teams" element={<AppliedTeams />} />
            <Route path="/team/:teamId" element={<TeamDetails />} />
            <Route path="/live-opening-creator-view/:teamId" element={<LiveOpeningCreatorView />} />
            <Route path="/live-opening-joining-view/:teamId" element={<LiveOpeningJoiningView />} />
            {/* Allow opening-joining view to accept teamId via query string as used by AppliedTeams */}
            <Route path="/live-opening-joining-view" element={<LiveOpeningJoiningView />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
