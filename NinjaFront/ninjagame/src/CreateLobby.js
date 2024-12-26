import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import './CreateLobby.css';

const CreateLobby = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateLobby = async () => {
    setLoading(true);

    try {
      const response = await fetch('/create-lobby/');
      const data = await response.json();
      navigate(`/admin/${data.lobby_code}`);
    } catch (error) {
      console.error('Failed to create lobby:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="create-lobby-container">
      <div className="content-wrapper text-center">
        <h1 className="title">Night of the Ninja</h1>
        <Button
          variant="dark"
          size="lg"
          className="create-lobby-btn"
          onClick={handleCreateLobby}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lobby'}
        </Button>
      </div>
    </Container>
  );
};

export default CreateLobby;
