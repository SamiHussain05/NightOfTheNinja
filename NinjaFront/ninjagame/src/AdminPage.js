import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Alert, ListGroup, Row, Col, Modal } from 'react-bootstrap';
import './AdminPage.css';

const AdminPage = () => {
  const { lobbyCode } = useParams();
  const [status, setStatus] = useState('');
  const [players, setPlayers] = useState([]);
  const [playerCardsCount, setPlayerCardsCount] = useState({});
  const [usedCards, setUsedCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const fetchRemovedCards = async () => {
    try {
      const response = await fetch(`/get-removed-cards/${lobbyCode}/`);
      const data = await response.json();
      if (response.ok) {
        setRemovedCards(data.removed_cards || []);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching removed cards:', error);
    }
  };

  const handleDealRemovedCard = async () => {
    if (!selectedPlayer) {
      setStatus('Please select a player to deal a card to.');
      return;
    }

    try {
      const response = await fetch(`/deal-removed-card/${lobbyCode}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: selectedPlayer,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('Card successfully dealt!');
        fetchPlayersAndCounts();
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error dealing removed card:', error);
    }
  };

  const handleKickPlayer = async () => {
    if (!selectedPlayer) {
      setStatus('Please select a player to kick.');
      return;
    }
  
    try {
      // Updated URL to include both the lobbyCode and selectedPlayer (player_id)
      const response = await fetch(`/lobby/${lobbyCode}/kick/${selectedPlayer}/`, {
        method: 'POST', // POST is appropriate here, assuming you're sending a request to kick a player
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
      if (response.ok) {
        setStatus('Player kicked successfully!');
        setSelectedPlayer(null);
        fetchPlayersAndCounts();  // Refresh the players list after kicking
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error kicking player: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchPlayersAndCounts();
    fetchUsedCards();
    fetchRemovedCards();
    const interval = setInterval(() => {
      fetchPlayersAndCounts();
      fetchUsedCards();
      fetchRemovedCards();
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

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <Container fluid className="admin-page-container">
      <div className="content-wrapper">
        <h1 className="admin-title">Game Administration</h1>
        <h2 className="lobby-code">Lobby Code: {lobbyCode}</h2>

        <Row className="mt-4">
          <Col md={6} className="players-section">
            <h3 className="players-heading">Players in this Lobby:</h3>
            {players.length > 0 ? (
              <ListGroup className="players-list">
                {players.map((player) => (
                  <ListGroup.Item
                    key={player.id}
                    className={`player-item ${selectedPlayer === player.id ? 'active' : ''}`}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    {player.name} - Ninja Cards: {playerCardsCount[player.id] || 0}
                    {selectedPlayer === player.id && (
                      <span className="selected-player-label">Selected</span>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="no-players">No players have joined yet.</p>
            )}
          </Col>

          <Col md={6} className="used-cards-section">
            <h3 className="used-cards-heading">Used Cards:</h3>
            {usedCards.length > 0 ? (
              <div className="used-cards-container">
                {usedCards.map((entry, index) => {
                  const cardNumber = entry.card.split('_').pop();
                  return (
                    <div key={index} className="card-container">
                      <img
                        src={`/static/cards/${entry.card}.jpg`}
                        alt={`Used Card ${entry.card}`}
                        className="used-card-image"
                        onClick={() => handleImageClick(`/static/cards/${entry.card}.jpg`)}
                      />
                      <div className="player-name">{entry.player_name}</div>
                      <div className="card-number">Card Number: {cardNumber}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No cards have been used yet.</p>
            )}
          </Col>
        </Row>

        <div className="action-buttons">
          <Button variant="primary" className ="deal-btn" onClick={handleDealRemovedCard} disabled={!selectedPlayer}>
            Deal Random Card to Selected Player
          </Button>
          <Button variant="dark" size="lg" className="reshuffle-btn" onClick={handleReshuffle}>
            Reshuffle Deck
          </Button>
          <Button variant="danger" className="kick-btn" onClick={handleKickPlayer} disabled={!selectedPlayer}>
            Kick Selected Player
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="delete-lobby-btn mt-4"
            onClick={handleDeleteLobby}
          >
            Delete Lobby
          </Button>
        </div>

        {status && (
          <Alert
            variant={status.startsWith('Error') ? 'danger' : 'success'}
            className="status-alert mt-4"
          >
            {status}
          </Alert>
        )}

        <Modal show={selectedImage !== null} onHide={handleCloseModal} centered size="lg">
          <div className="modal-overlay" onClick={handleCloseModal}>
            <img src={selectedImage} alt="Enlarged Card" className="modal-image" />
          </div>
        </Modal>
      </div>
    </Container>
  );
};

export default AdminPage;
