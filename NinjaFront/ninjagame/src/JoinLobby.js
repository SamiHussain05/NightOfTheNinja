import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { Container, Button, Form, Alert } from 'react-bootstrap';
import './JoinLobby.css';

const JoinLobby = () => {
  const [lobbyCode, setLobbyCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleJoinLobby = async () => {
    setErrorMessage(''); // Reset error message

    try {
      const response = await fetch(`/join-lobby/${lobbyCode}/?name=${playerName}`);
      const data = await response.json();

      if (data.players_count) {
        alert(`Joined lobby. There are now ${data.players_count} players in the lobby.`);

        // Redirect the user to their player card page
        navigate(`/cards/${lobbyCode}/${data.player_id}`);
      } else {
        setErrorMessage('Failed to join the lobby. Please check the Lobby Code and try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Container fluid className="join-lobby-container">
      <div className="content-wrapper text-center">
        <h1 className="join-title">Join a Lobby</h1>

        <Form className="join-form">
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Lobby Code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value)}
              className="input-field"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input-field"
            />
          </Form.Group>

          <Button
            variant="dark"
            size="lg"
            className="join-btn"
            onClick={handleJoinLobby}
          >
            Join Lobby
          </Button>
        </Form>

        {errorMessage && (
          <Alert variant="danger" className="error-alert mt-4">
            {errorMessage}
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default JoinLobby;
