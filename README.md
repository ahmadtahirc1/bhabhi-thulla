# 🃏 Bhabhi Thulla — Multiplayer Card Game

A real-time multiplayer implementation of the classic South Asian card game **Bhabhi Thulla**, built with Node.js, Express, Socket.IO, React, and Tailwind CSS.

---

## 📁 Project Structure

```
bhabhi-thulla/
├── server/                    # Node.js + Express + Socket.IO backend
│   ├── src/
│   │   ├── index.js           # Entry point, HTTP + Socket server
│   │   ├── game/
│   │   │   ├── GameManager.js # Core game logic, state, rules
│   │   │   └── RoomManager.js # Room lifecycle management
│   │   ├── socket/
│   │   │   └── handlers.js    # All Socket.IO event handlers
│   │   └── utils/
│   │       └── cards.js       # Deck creation, shuffle, deal, compare
│   └── package.json
│
└── client/                    # React + Vite + Tailwind frontend
    ├── src/
    │   ├── main.jsx            # React entry point
    │   ├── App.jsx             # Root app + screen router
    │   ├── context/
    │   │   └── SocketContext.jsx # Socket.IO connection context
    │   ├── hooks/
    │   │   └── useGame.js      # Game state hook (all socket events)
    │   ├── utils/
    │   │   └── cardHelpers.js  # Suit symbols, colors, sorting
    │   ├── components/
    │   │   ├── lobby/
    │   │   │   ├── LobbyScreen.jsx   # Join/Create/Browse rooms
    │   │   │   └── WaitingScreen.jsx # Waiting for players
    │   │   ├── game/
    │   │   │   ├── GameScreen.jsx      # Main game table layout
    │   │   │   ├── GameTable.jsx       # Center felt table + round cards
    │   │   │   ├── PlayerHand.jsx      # Your hand of cards
    │   │   │   ├── PlayerPanel.jsx     # Opponent info panels
    │   │   │   ├── RoundResultOverlay.jsx # Round win/thulla popup
    │   │   │   └── GameOverScreen.jsx  # Final scoreboard
    │   │   └── ui/
    │   │       ├── PlayingCard.jsx  # Single card renderer
    │   │       └── Notification.jsx # Toast notifications
    │   └── index.css           # Tailwind + custom styles
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Step 1 — Install dependencies

```bash
# From root of project
cd server && npm install
cd ../client && npm install
```

### Step 2 — Start the server

```bash
cd server
npm run dev       # Development (with nodemon auto-reload)
# or
npm start         # Production
```

Server runs on **http://localhost:3001**

### Step 3 — Start the client

Open a **new terminal**:

```bash
cd client
npm run dev
```

Client runs on **http://localhost:5173**

### Step 4 — Play!

1. Open **4 browser tabs** (or use different devices on the same network)
2. Each player enters their name and the **same room code**
3. Game starts automatically when 4 players have joined
4. The player with the **Ace of Spades** goes first!

---

## 🎮 Game Rules

### Setup
- Standard 52-card deck, dealt 13 cards per player
- Player holding the **Ace of Spades** leads the first round

### Gameplay
1. **Leading player** plays any card — that card's suit becomes the **leading suit**
2. Each subsequent player **must follow the leading suit** if they have it
3. If a player **cannot follow suit**, they may play any card
4. When all 4 cards are played, the **round ends**

### Winning a Round
- The **highest card of the leading suit** wins the round
- The winner leads the next round

### THULLA! 🔥
- If any player **breaks the suit** (plays a different suit when they had the leading suit), a **THULLA** is declared
- The round winner gains a Thulla point

### Finishing
- When a player plays their last card, they're **out of the game** (safe!)
- The **last remaining player** (who still has cards) is the **Bhabhi** — the loser!

---

## 🔌 Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ roomId, playerName }` | Join or create a room |
| `playCard` | `{ cardId }` | Play a card from your hand |
| `restartGame` | — | Restart after game over |
| `requestState` | — | Refresh current game state |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `joined` | `{ playerId, roomId, playerName }` | Confirmed join |
| `joinError` | `{ error }` | Failed to join |
| `availableRooms` | `Room[]` | List of open rooms |
| `roomUpdate` | `{ players, playerCount, canStart }` | Room state changed |
| `gameStart` | `{ message, publicState }` | Game has begun |
| `yourCards` | `{ hand: Card[] }` | Your private hand |
| `gameState` | `PublicGameState` | Full public game state |
| `roundResult` | `RoundResult` | Round outcome |
| `gameOver` | `{ loserId, loserName, finalScores }` | Game ended |
| `playError` | `{ error }` | Invalid move |
| `playerLeft` | `{ message }` | A player disconnected |

---

## 🏗️ Architecture Notes

- **Authoritative server**: All game state lives on the server. The client only renders what the server sends.
- **Private hands**: Each player's cards are sent only to that player via `yourCards` — other players cannot see your cards.
- **Room isolation**: Each room runs an independent `GameManager` instance.
- **Auto-start**: Game starts automatically when 4 players join the same room.
- **Turn validation**: The server validates every card play — wrong turn, invalid suit, card not in hand are all caught server-side.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js |
| HTTP server | Express |
| Real-time | Socket.IO |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | CSS keyframes |
| Fonts | Playfair Display + Crimson Text |

---

## 🔧 Configuration

### Server
Set environment variables before starting:
```bash
PORT=3001              # Server port (default: 3001)
CLIENT_URL=http://localhost:5173  # Allowed CORS origin
```

### Client
Edit `client/.env`:
```bash
VITE_SERVER_URL=http://localhost:3001
```

For production, point `VITE_SERVER_URL` to your deployed server URL.

---

## 🐛 Troubleshooting

**"Cannot connect to server"**
- Make sure the server is running on port 3001
- Check `VITE_SERVER_URL` in `client/.env`

**"Room not found" after refresh**
- The server restarts clear all rooms. Rejoin from the lobby.

**Cards not showing**
- Check browser console for socket errors
- Ensure both server and client are running

**4 players required**
- Open 4 separate browser tabs/windows to simulate 4 players
- Each tab should use the same room code but a different player name
