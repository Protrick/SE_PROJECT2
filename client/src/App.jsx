import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import JoinTeam from './pages/joinTeam.jsx'
import CreateTeam from './pages/createTeam.jsx'

import { BrowserRouter,Routes , Route} from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import LiveOpeningCreatorView from './pages/liveOpeningCreatorView.jsx'
import LiveOpeningJoiningView from './pages/liveOpeningJoiningView.jsx'

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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
