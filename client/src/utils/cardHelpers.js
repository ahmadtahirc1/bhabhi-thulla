export const SUIT_SYMBOLS = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS = {
  spades: '#1c1917',
  clubs: '#1c1917',
  hearts: '#dc2626',
  diamonds: '#dc2626',
};

export function getSuitSymbol(suit) {
  return SUIT_SYMBOLS[suit] || suit;
}

export function getSuitColor(suit) {
  return SUIT_COLORS[suit] || '#000';
}

export function getCardLabel(card) {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}

export function isRedSuit(suit) {
  return suit === 'hearts' || suit === 'diamonds';
}

export function sortHand(hand) {
  const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  const rankOrder = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return rankOrder[a.rank] - rankOrder[b.rank];
  });
}
