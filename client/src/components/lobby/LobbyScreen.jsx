import { useState } from 'react';
import { getSuitSymbol } from '../../utils/cardHelpers';

export function LobbyScreen({ onJoin, availableRooms, error }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [tab, setTab] = useState('join'); // join | create | browse

  const handleJoin = (e) => {
    e?.preventDefault();
    const name = playerName.trim();
    const room = roomId.trim() || generateRoomId();
    if (!name) return;
    onJoin(room, name);
  };

  const handleBrowseJoin = (room) => {
    const name = playerName.trim();
    if (!name) {
      alert('Enter your name first!');
      return;
    }
    onJoin(room.id, name);
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const quickCreate = () => {
    const name = playerName.trim();
    if (!name) return;
    const room = generateRoomId();
    setRoomId(room);
    onJoin(room, name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden felt-texture">
      {/* Decorative background cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['♠', '♥', '♦', '♣'].map((suit, i) => (
          <div key={i} className="absolute text-white/5 font-display font-bold select-none"
            style={{
              fontSize: '20vw',
              top: `${[5, 60, 20, 70][i]}%`,
              left: `${[5, 75, 40, 15][i]}%`,
              transform: `rotate(${[-15, 10, -5, 20][i]}deg)`,
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}>
            {suit}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center gap-3 mb-3 text-4xl">
            <span>♠</span>
            <span style={{ color: '#dc2626' }}>♥</span>
            <span style={{ color: '#dc2626' }}>♦</span>
            <span>♣</span>
          </div>
          <h1 className="font-display text-5xl font-extrabold gold-text tracking-tight mb-2">
            Bhabhi Thulla
          </h1>
          <p className="text-emerald-400/70 font-body text-lg italic">
            The classic South Asian card game
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-2xl p-6">
          {/* Name input */}
          <div className="mb-5">
            <label className="block text-amber-300/80 font-display text-sm mb-2 tracking-wider uppercase">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 transition-colors font-body text-base"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-white/10 mb-5">
            {['join', 'create', 'browse'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-display capitalize transition-all ${
                  tab === t
                    ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400'
                    : 'text-white/50 hover:text-white/80'
                }`}>
                {t === 'join' ? '🚪 Join' : t === 'create' ? '✨ Create' : '🔍 Browse'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'join' && (
            <div>
              <label className="block text-amber-300/80 font-display text-sm mb-2 tracking-wider uppercase">
                Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  maxLength={10}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 transition-colors font-mono text-base tracking-widest uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <button onClick={handleJoin} disabled={!playerName.trim() || !roomId.trim()}
                  className="btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  Join
                </button>
              </div>
            </div>
          )}

          {tab === 'create' && (
            <div>
              <p className="text-white/60 text-sm font-body mb-4">
                Create a new room and share the code with friends. Game starts automatically when 4 players join.
              </p>
              <button onClick={quickCreate} disabled={!playerName.trim()}
                className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                Create New Room
              </button>
            </div>
          )}

          {tab === 'browse' && (
            <div>
              {availableRooms.length === 0 ? (
                <p className="text-white/40 text-center py-4 font-body italic">
                  No open rooms available
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableRooms.map(room => (
                    <div key={room.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                      <div>
                        <span className="font-mono text-amber-300 font-medium">{room.id}</span>
                        <span className="text-white/50 text-sm ml-3">{room.playerCount}/4 players</span>
                      </div>
                      <button onClick={() => handleBrowseJoin(room)}
                        className="text-xs btn-secondary py-1.5 px-3">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-900/40 border border-red-500/40 rounded-lg px-4 py-2 text-red-300 text-sm font-body">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Rules hint */}
        <div className="mt-6 glass-panel rounded-xl p-4">
          <h3 className="font-display text-amber-400/80 text-sm mb-2">📜 Quick Rules</h3>
          <ul className="text-white/50 text-xs font-body space-y-1">
            <li>• Player with Ace of Spades leads first</li>
            <li>• Must follow the leading suit if possible</li>
            <li>• Highest card of leading suit wins the round</li>
            <li>• Breaking suit = THULLA (win for round winner)</li>
            <li>• Last player with cards is the Bhabhi (loser)!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
