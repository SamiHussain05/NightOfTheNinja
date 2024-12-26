import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateLobby from './CreateLobby';
import JoinLobby from './JoinLobby';
import PlayerCards from './PlayerCards';
import AdminPage from './AdminPage';
import './App.css'; // Import custom CSS file

function App() {
  return (
    <Router>
      <div className="App-header">
        <h1 className="game-title">Night of the Ninja</h1>
        <h2 className="developer-info">Developed by: Sami Hussain</h2>
        <h2 className="artist-info">Art by: Hamzah Hussain</h2>
      </div>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<CreateLobby />} />
          <Route path="/join" element={<JoinLobby />} />
          <Route path="/cards/:lobbyCode/:playerId" element={<PlayerCards />} />
          <Route path="/admin/:lobbyCode" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
