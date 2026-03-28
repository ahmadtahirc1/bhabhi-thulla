// Card utilities for Bhabhi Thulla

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}_${suit}` });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck, numPlayers = 4) {
  const hands = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, index) => {
    hands[index % numPlayers].push(card);
  });
  return hands;
}

function getCardValue(card) {
  return RANK_VALUES[card.rank];
}

function compareCards(cardA, cardB, leadingSuit) {
  // Only cards of leading suit can win
  if (cardA.suit === leadingSuit && cardB.suit !== leadingSuit) return 1;
  if (cardA.suit !== leadingSuit && cardB.suit === leadingSuit) return -1;
  if (cardA.suit !== leadingSuit && cardB.suit !== leadingSuit) return 0;
  return getCardValue(cardA) - getCardValue(cardB);
}

function findWinningCard(roundCards, leadingSuit) {
  let winner = roundCards[0];
  for (let i = 1; i < roundCards.length; i++) {
    if (compareCards(roundCards[i].card, winner.card, leadingSuit) > 0) {
      winner = roundCards[i];
    }
  }
  return winner;
}

function hasAceOfSpades(hand) {
  return hand.some(card => card.rank === 'A' && card.suit === 'spades');
}

function hasSuit(hand, suit) {
  return hand.some(card => card.suit === suit);
}

module.exports = {
  SUITS,
  RANKS,
  createDeck,
  shuffleDeck,
  dealCards,
  getCardValue,
  compareCards,
  findWinningCard,
  hasAceOfSpades,
  hasSuit
};
