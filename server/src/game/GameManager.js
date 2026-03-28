const {
  createDeck,
  shuffleDeck,
  dealCards,
  findWinningCard,
  hasAceOfSpades,
  hasSuit
} = require('../utils/cards');

const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

class GameManager {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = []; // { id, name, socketId }
    this.hands = {};   // playerId -> card[]
    this.scores = {};  // playerId -> number of thulla wins
    this.state = GAME_STATES.WAITING;
    this.currentRound = [];  // [{ playerId, card }]
    this.leadingSuit = null;
    this.currentPlayerIndex = 0;
    this.roundNumber = 0;
    this.finishedPlayers = []; // players who ran out of cards
    this.collectedCards = {}; // playerId -> collected cards (for thulla tracking)
    this.thullaCount = {}; // playerId -> number of thullas
    this.turnOrder = []; // player ids in turn order
    this.lastRoundResult = null;
    this.roundHistory = []; // last N round results for the log
  }

  addPlayer(playerInfo) {
    if (this.players.length >= 4) return { success: false, error: 'Room is full' };
    if (this.state !== GAME_STATES.WAITING) return { success: false, error: 'Game already started' };
    if (this.players.find(p => p.id === playerInfo.id)) {
      return { success: false, error: 'Already in room' };
    }
    this.players.push(playerInfo);
    return { success: true };
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
  }

  canStart() {
    return this.players.length === 4;
  }

  startGame() {
    if (!this.canStart()) return { success: false, error: 'Need exactly 4 players' };

    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4);

    this.players.forEach((player, index) => {
      this.hands[player.id] = hands[index];
      this.scores[player.id] = 0;
      this.thullaCount[player.id] = 0;
      this.collectedCards[player.id] = [];
    });

    // Find who has Ace of Spades
    let startingPlayerIndex = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (hasAceOfSpades(this.hands[this.players[i].id])) {
        startingPlayerIndex = i;
        break;
      }
    }

    this.turnOrder = this.players.map(p => p.id);
    this.currentPlayerIndex = startingPlayerIndex;
    this.state = GAME_STATES.PLAYING;
    this.roundNumber = 0;
    this.currentRound = [];
    this.leadingSuit = null;

    return { success: true };
  }

  getCurrentPlayerId() {
    const activePlayers = this.turnOrder.filter(id => !this.finishedPlayers.includes(id));
    if (activePlayers.length === 0) return null;
    // currentPlayerIndex refers to position in turnOrder
    const id = this.turnOrder[this.currentPlayerIndex];
    // skip finished players
    if (this.finishedPlayers.includes(id)) {
      this.advanceTurn();
      return this.getCurrentPlayerId();
    }
    return id;
  }

  validatePlay(playerId, cardId) {
    if (this.state !== GAME_STATES.PLAYING) {
      return { valid: false, error: 'Game is not in playing state' };
    }

    const currentId = this.getCurrentPlayerId();
    if (currentId !== playerId) {
      return { valid: false, error: 'Not your turn' };
    }

    const hand = this.hands[playerId];
    if (!hand) return { valid: false, error: 'Player not found' };

    const card = hand.find(c => c.id === cardId);
    if (!card) return { valid: false, error: 'Card not in your hand' };

    // If leading suit is established, player must follow suit if possible
    if (this.leadingSuit && this.currentRound.length > 0) {
      if (hasSuit(hand, this.leadingSuit) && card.suit !== this.leadingSuit) {
        return { valid: false, error: `You must play a ${this.leadingSuit} card` };
      }
    }

    return { valid: true, card };
  }

  playCard(playerId, cardId) {
    const validation = this.validatePlay(playerId, cardId);
    if (!validation.valid) return { success: false, error: validation.error };

    const card = validation.card;

    // Remove card from hand
    this.hands[playerId] = this.hands[playerId].filter(c => c.id !== cardId);

    // Set leading suit if first card of round
    if (this.currentRound.length === 0) {
      this.leadingSuit = card.suit;
    }

    // Add to current round
    this.currentRound.push({ playerId, card });

    // ── NEW RULE: broken suit → round ends immediately ──────────
    // If this card doesn't match the leading suit, the player had
    // no cards of that suit. Round ends right here — all played
    // cards go to the current highest-card holder as penalty.
    if (card.suit !== this.leadingSuit) {
      return this.resolveRound({ brokenBy: playerId });
    }

    // Check if all active players have played (normal completion)
    const activePlayers = this.turnOrder.filter(id => !this.finishedPlayers.includes(id));
    if (this.currentRound.length === activePlayers.length) {
      return this.resolveRound({});
    }

    // Advance to next player
    this.advanceTurn();

    return {
      success: true,
      roundComplete: false,
      currentPlayerId: this.getCurrentPlayerId()
    };
  }

  resolveRound({ brokenBy = null } = {}) {
    this.roundNumber++;

    // Find the current winner = highest card of the leading suit among cards played so far
    const winner = findWinningCard(this.currentRound, this.leadingSuit);
    const winnerId = winner.playerId;

    // THULLA: round was cut short because someone broke suit
    const isThulla = brokenBy !== null;
    const thullaPlayers = brokenBy ? [brokenBy] : [];

    // ── CARD RESOLUTION ─────────────────────────────────────────
    // THULLA: all played cards go into the winner's hand as penalty.
    // Normal round: cards are simply discarded — nobody gets them.
    const roundCards = this.currentRound.map(r => r.card);
    let penaltyCardCount = 0;

    if (isThulla) {
      // Penalty: winner collects all cards back into their hand
      this.hands[winnerId] = [...this.hands[winnerId], ...roundCards];
      this.collectedCards[winnerId] = [
        ...(this.collectedCards[winnerId] || []),
        ...roundCards
      ];
      penaltyCardCount = roundCards.length;
      this.thullaCount[winnerId] = (this.thullaCount[winnerId] || 0) + 1;
    }
    // else: cards discarded — just don't add them anywhere

    const roundResult = {
      roundNumber: this.roundNumber,
      plays: [...this.currentRound],
      winnerId,
      winnerName: this.players.find(p => p.id === winnerId)?.name,
      leadingSuit: this.leadingSuit,
      isThulla,
      thullaPlayers,
      brokenBy,
      brokenByName: brokenBy ? this.players.find(p => p.id === brokenBy)?.name : null,
      winningCard: winner.card,
      penaltyCardCount,
      earlyEnd: isThulla
    };

    this.lastRoundResult = roundResult;
    this.roundHistory = [roundResult, ...this.roundHistory].slice(0, 10);

    // Check who ran out of cards.
    // On THULLA: winner gained cards (can't be empty), check everyone else.
    // On normal round: winner discarded their card too, so check everyone.
    this.currentRound.forEach(({ playerId }) => {
      if (this.hands[playerId]?.length === 0 &&
          !this.finishedPlayers.includes(playerId)) {
        this.finishedPlayers.push(playerId);
      }
    });

    // Reset round state
    this.currentRound = [];
    this.leadingSuit = null;

    // Winner leads next round
    this.currentPlayerIndex = this.turnOrder.indexOf(winnerId);

    // Check game over
    const activePlayers = this.turnOrder.filter(id => !this.finishedPlayers.includes(id));

    if (activePlayers.length <= 1) {
      this.state = GAME_STATES.GAME_OVER;
      const loser = activePlayers.length === 1
        ? activePlayers[0]
        : this.finishedPlayers[this.finishedPlayers.length - 1];

      if (loser && !this.finishedPlayers.includes(loser)) {
        this.finishedPlayers.push(loser);
      }

      return {
        success: true,
        roundComplete: true,
        roundResult,
        gameOver: true,
        loserId: loser,
        loserName: this.players.find(p => p.id === loser)?.name,
        finalScores: this.getFinalScores()
      };
    }

    // If winner just finished (impossible now since they gained cards, but safety check)
    if (this.finishedPlayers.includes(winnerId)) {
      this.advanceTurn();
    }

    return {
      success: true,
      roundComplete: true,
      roundResult,
      gameOver: false,
      currentPlayerId: this.getCurrentPlayerId()
    };
  }

  advanceTurn() {
    let attempts = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.turnOrder.length;
      attempts++;
    } while (
      this.finishedPlayers.includes(this.turnOrder[this.currentPlayerIndex]) &&
      attempts < this.turnOrder.length
    );
  }

  getFinalScores() {
    const scores = {};
    this.players.forEach(player => {
      scores[player.id] = {
        name: player.name,
        thullaCount: this.thullaCount[player.id] || 0,
        cardsCollected: this.collectedCards[player.id]?.length || 0,
        finished: this.finishedPlayers.includes(player.id),
        finishPosition: this.finishedPlayers.indexOf(player.id) + 1
      };
    });
    return scores;
  }

  getPublicState() {
    return {
      roomId: this.roomId,
      state: this.state,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        cardCount: this.hands[p.id]?.length || 0,
        thullaCount: this.thullaCount[p.id] || 0,
        finished: this.finishedPlayers.includes(p.id),
        finishPosition: this.finishedPlayers.indexOf(p.id) + 1
      })),
      currentPlayerId: this.state === GAME_STATES.PLAYING ? this.getCurrentPlayerId() : null,
      currentRound: this.currentRound,
      leadingSuit: this.leadingSuit,
      roundNumber: this.roundNumber,
      finishedPlayers: this.finishedPlayers,
      lastRoundResult: this.lastRoundResult,
      roundHistory: this.roundHistory
    };
  }

  getPrivateState(playerId) {
    return {
      hand: this.hands[playerId] || []
    };
  }
}

module.exports = { GameManager, GAME_STATES };
