import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import './PlayerCards.css';

const PlayerCards = () => {
  const { lobbyCode, playerId } = useParams(); // Retrieve lobbyCode and playerId from URL params
  const [cards, setCards] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]); // Track flipped ninja cards state
  const [flippedHouseCard, setFlippedHouseCard] = useState(false); // Track flipped house card state
  const [selectedCards, setSelectedCards] = useState([]); // Track selected cards for discarding
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
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [lobbyCode, playerId, usedCards]); // Reinitialize polling if lobbyCode, playerId, or usedCards changes

  // Reset the selectedCards state every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCards([]); // Clear selected cards state
    }, 10000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

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
    setSelectedCards((prevSelectedCards) => {
      if (prevSelectedCards.includes(card)) {
        // Deselect the card if it's already selected
        return prevSelectedCards.filter((selectedCard) => selectedCard !== card);
      } else if (prevSelectedCards.length < 2) {
        // Select the card if it's not already selected (and we have fewer than 2 selected)
        return [...prevSelectedCards, card];
      }
      return prevSelectedCards; // If 2 cards are already selected, don't allow more selections
    });
  };

  const handleSubmitDiscard = async () => {
    try {
      const response = await fetch(`/discard-and-redistribute/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discarded_cards: selectedCards }),
      });

      const data = await response.json();

      if (data.status === 'Cards discarded and redistributed successfully.') {
        setUsedCards((prevUsedCards) => [...prevUsedCards, ...selectedCards]);
        setDiscardSubmitted(true);
        setSelectedCards([]); 
        fetchCards();
        setFlippedCards([]);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error discarding cards:', error);
    }
  };

  const handleRemoveCard = async () => {
    try {
      const response = await fetch(`/remove-card/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_to_remove: selectedCards[0] }),
      });
      const data = await response.json();

      if (data.status === 'Card removed successfully from the game.') {
        setRemoveSubmitted(true);
        setSelectedCards([]);
        setFlippedCards([]);
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
      if (selectedCards.length !== 1) {
        console.error('Please select exactly 1 card to use.');
        return;
      }

      const cardToUse = selectedCards[0];
      const updatedNinjaCards = cards.ninja_cards.filter(card => card !== cardToUse);
      setCards(prevCards => ({
        ...prevCards,
        ninja_cards: updatedNinjaCards
      }));

      setSelectedCards([]); // Reset the selected cards immediately before the API call

      const response = await fetch(`/get-used-cards/${lobbyCode}/${playerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used_card: cardToUse }),
      });

      const data = await response.json();
      if (data.status === 'Cards used successfully.') {
        setUsedCards((prevUsedCards) => [...prevUsedCards, cardToUse]);
        setFlippedCards([]);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error using cards:', error);
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
            {/* Checkbox for selecting cards */}
            <div className="checkbox-container">
              <input
                type="checkbox"
                id={`checkbox-${index}`}
                checked={selectedCards.includes(card)}
                onChange={() => handleSelectCard(card)}
              />
              <label htmlFor={`checkbox-${index}`}>Select</label>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="use-card-button"
          onClick={handleUseCard}
          disabled={selectedCards.length !== 1} 
        >
          Use Card
        </button>

        <button
          className="submit-discard-button"
          onClick={handleSubmitDiscard}
          disabled={selectedCards.length !== 2}
        >
          Submit Pass
        </button>

        <button
          className="submit-remove-button"
          onClick={handleRemoveCard}
          disabled={selectedCards.length !== 1}
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
