import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import './AdminPage.css';

const AdminPage = () => {
  const { lobbyCode } = useParams();
  const [status, setStatus] = useState('');
  const [players, setPlayers] = useState([]);
  const [playerCardsCount, setPlayerCardsCount] = useState({});
  const [usedCards, setUsedCards] = useState([]);

  // Fetch players and their ninja card counts
  const fetchPlayersAndCounts = async () => {
    try {
      const response = await fetch(`/get-players/${lobbyCode}`);
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.players);
        const counts = {};
        for (const player of data.players) {
          const cardResponse = await fetch(`/get-player-cards/${lobbyCode}/${player.id}`);
          const cardData = await cardResponse.json();
          counts[player.id] = cardData.ninja_cards?.length || 0;
        }
        setPlayerCardsCount(counts);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error fetching players: ${error.message}`);
    }
  };

  // Fetch used cards
  const fetchUsedCards = async () => {
    try {
      const response = await fetch(`/get-used-cards/${lobbyCode}/`);
      const data = await response.json();
      if (response.ok) {
        setUsedCards(data.used_cards || []);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching used cards:', error);
    }
  };

  useEffect(() => {
    fetchPlayersAndCounts();
    fetchUsedCards();
    const interval = setInterval(() => {
      fetchPlayersAndCounts();
      fetchUsedCards();
    }, 5000);

    return () => clearInterval(interval);
  }, [lobbyCode]);

  const handleReshuffle = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`/reshuffle/${lobbyCode}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.error) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus(data.status || 'Cards reshuffled successfully');
        setUsedCards([]);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleDeleteLobby = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`/delete-lobby/${lobbyCode}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.message) {
        setStatus(data.message);
        window.location.href = '/';
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <Container fluid className="admin-page-container">
      <div className="content-wrapper text-center">
        <h1 className="admin-title">Game Administration</h1>
        <h2 className="lobby-code">Lobby Code: {lobbyCode}</h2>

        <h3 className="players-heading">Players in this Lobby:</h3>
        {players.length > 0 ? (
          <ListGroup className="players-list">
            {players.map((player) => (
              <ListGroup.Item key={player.id} className="player-item">
                {player.name} - Ninja Cards: {playerCardsCount[player.id] || 0}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="no-players">No players have joined yet.</p>
        )}

      <h3 className="used-cards-heading">Used Cards:</h3>
      {usedCards.length > 0 ? (
        <div className="used-cards-container">
          {usedCards.map((entry, index) => (
            <div key={index} className="card-container">
              <img
                src={`/static/cards/${entry.card}.jpg`}
                alt={`Used Card ${entry.card}`}
                className="used-card-image"
              />
              <div className="player-name">{entry.player_name}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No cards have been used yet.</p>
      )}

        <Button
          variant="dark"
          size="lg"
          className="reshuffle-btn"
          onClick={handleReshuffle}
        >
          Reshuffle Deck
        </Button>

        <Button
          variant="danger"
          size="lg"
          className="delete-lobby-btn mt-4"
          onClick={handleDeleteLobby}
        >
          Delete Lobby
        </Button>

        {status && (
          <Alert
            variant={status.startsWith('Error') ? 'danger' : 'success'}
            className="status-alert mt-4"
          >
            {status}
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default AdminPage;
