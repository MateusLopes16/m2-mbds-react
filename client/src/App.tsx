import './App.scss'
import Lobby from './components/lobby/Lobby'
import Game from './components/game/Game'
import ReplayGame from './components/game/replay/ReplayGame'
import { Routes, Route, Navigate } from 'react-router-dom'
import Waiting from './components/lobby/Waiting'
import Leaderboard from './components/game/leaderboard/Leaderboard'
import Rules from './components/rules/rules'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="baseline"><Lobby /></div>
      } />
      <Route path="/lobby/:id" element={<Waiting />} />
      <Route path="/Game/:id" element={<Game />} />
      <Route path="/replay/:id" element={
        <div className="baseline"><ReplayGame /></div>} />
      <Route path="/leaderboard/:id" element={<Leaderboard />} />
      <Route
        path="/rules"
        element={(
          <div className="baseline">
            <Rules />
          </div>
        )}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
