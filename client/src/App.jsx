import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JoinTeam from './pages/JoinTeam.jsx'
import CreateTeam from './pages/CreateTeam.jsx'

import { BrowserRouter,Routes , Route} from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import LiveOpeningCreatorView from './pages/LiveOpeningCreatorView.jsx'
import LiveOpeningJoiningView from './pages/LiveOpeningJoiningView.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join-team" element={<JoinTeam />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/live-opening-creator-view" element={<LiveOpeningCreatorView />} />
          <Route path="/live-opening-joining-view" element={<LiveOpeningJoiningView />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
