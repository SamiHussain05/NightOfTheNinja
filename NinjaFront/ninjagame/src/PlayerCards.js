import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import './PlayerCards.css';

const PlayerCards = () => {
  const { lobbyCode, playerId } = useParams(); // Retrieve lobbyCode and playerId from URL params
  const [cards, setCards] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]); // Track flipped ninja cards state
  const [flippedHouseCard, setFlippedHouseCard] = useState(false); // Track flipped house card state
  const [selectedCard, setSelectedCard] = useState(null); // Track selected card for discarding
  const [discardSubmitted, setDiscardSubmitted] = useState(false); // Track if discard has been submitted
  const [removeSubmitted, setRemoveSubmitted] = useState(false); // Track if remove has been submitted
  const [usedCards, setUsedCards] = useState([]); // Track used cards locally to avoid resubmitting them

  const fetchCards = async () => {
    try {
      const response = await fetch(`/get-player-cards/${lobbyCode}/${playerId}/`);
      const data = await response.json();
  
      if (data && data.house_card && data.ninja_cards) {
        const playerCards = {
          house_card: data.house_card,
          ninja_cards: data.ninja_cards.filter(card => !usedCards.includes(card)), // Filter out used cards
        };
  
        localStorage.setItem(`playerCards_${lobbyCode}_${playerId}`, JSON.stringify(playerCards));
        setCards(playerCards);
      } else {
        console.error("Player cards not found.");
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCards();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchCards();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [lobbyCode, playerId, usedCards]); // Reinitialize polling if lobbyCode, playerId, or usedCards changes

  const handleCardClick = (index) => {
    setFlippedCards((prevFlippedCards) => {
      const newFlippedCards = [...prevFlippedCards];
      newFlippedCards[index] = !newFlippedCards[index];
      return newFlippedCards;
    });
  };

  const handleHouseCardClick = () => {
    setFlippedHouseCard(!flippedHouseCard);
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card); // Allow only one card to be selected
  };

  const handleSubmitDiscard = async () => {
    try {
      const response = await fetch(`/discard-and-redistribute/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discarded_card: selectedCard }),
      });
      const data = await response.json();
  
      if (data.status === 'Card discarded and redistributed successfully.') {
        setUsedCards((prevUsedCards) => [...prevUsedCards, selectedCard]); // Add to used cards
        setDiscardSubmitted(true);
        fetchCards();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error discarding card:', error);
    }
  };

  const handleRemoveCard = async () => {
    try {
      const response = await fetch(`/remove-card/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_to_remove: selectedCard }),
      });
      const data = await response.json();
  
      if (data.status === 'Card removed successfully from the game.') {
        setUsedCards((prevUsedCards) => [...prevUsedCards, selectedCard]); // Add to used cards
        setRemoveSubmitted(true);
        fetchCards();
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  const handleUseCard = async () => {
    try {
      const response = await fetch(`/get-used-cards/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used_card: selectedCard }),
      });
  
      const data = await response.json();
      if (data.status === 'Card used successfully.') {
        setSelectedCard(null); // Clear the selected card
  
        // Now remove the card from the player's hand
        await handleRemoveCard(); // Call to remove the used card from the player
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error using card:', error);
    }
  };

  if (!cards) return <p>Loading...</p>;

  return (
    <div className="player-cards-container">
      <h3 className="cards-title">Your Cards</h3>

      {/* House Card */}
      <div className="card-container">
        <div
          className={`card ${flippedHouseCard ? 'flipped' : ''}`}
        >
          <div className="card front" onClick={handleHouseCardClick}>
            <img
              src={`/static/cards/${cards.house_card}.jpg`}
              alt="House Card"
              className="card-image"
            />
          </div>
          <div className="card back" onClick={handleHouseCardClick}>
            <img
              src={`/static/cards/house_cards.jpg`}
              alt="Back House Card"
              className="card-image"
            />
          </div>
        </div>
      </div>

      <div className="ninja-cards-container">
        {cards.ninja_cards.map((card, index) => (
          <div key={index} className="card-container">
            <div
              className={`card ${flippedCards[index] ? 'flipped' : ''}`}
            >
              <div className="card front" onClick={() => handleCardClick(index)}>
                <img
                  src={`/static/cards/${card}.jpg`}
                  alt={`Ninja Card ${index + 1}`}
                  className="card-image"
                />
              </div>
              <div className="card back" onClick={() => handleCardClick(index)}>
                <img
                  src={`/static/cards/ninja_cards.jpg`}
                  alt={`Back Ninja Card ${index + 1}`}
                  className="card-image"
                />
              </div>
            </div>
            {/* Checkbox for selecting card (Always visible) */}
            <div className="checkbox-container">
              <input
                type="checkbox"
                id={`checkbox-${index}`}
                checked={selectedCard === card}
                onChange={() => handleSelectCard(card)}
              />
              <label htmlFor={`checkbox-${index}`}>Select</label>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {/* Use Card Button */}
        <button
          className="use-card-button"
          onClick={handleUseCard}
          disabled={!selectedCard}
        >
          Use Card
        </button>

        {/* Submit Discard Button */}
        <button
          className="submit-discard-button"
          onClick={handleSubmitDiscard}
          disabled={!selectedCard}
        >
          Submit Pass
        </button>

        {/* Submit Remove Button */}
        <button
          className="submit-remove-button"
          onClick={handleRemoveCard}
          disabled={!selectedCard}
        >
          Remove Card
        </button>
      </div>

      {/* Discard Confirmation */}
      {discardSubmitted && <p>Pass submitted successfully!</p>}

      {/* Remove Confirmation */}
      {removeSubmitted && <p>Card removed from the game successfully!</p>}
    </div>
  );
};

export default PlayerCards;
