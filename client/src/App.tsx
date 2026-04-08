import './App.scss'
import Lobby from './components/lobby/Lobby'
import Game from './components/game/Game'
import { Routes, Route, Navigate } from 'react-router-dom'
import Waiting from './components/lobby/Waiting'
import Leaderboard from './components/game/Leaderboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/lobby/:id" element={<Waiting />} />
      <Route path="/Game/:id" element={<Game />} />
      <Route path="/leaderboard/:id" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
