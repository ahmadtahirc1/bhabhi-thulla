import { useState } from 'react';
import { PlayerPanel } from './PlayerPanel';
import { GameTable } from './GameTable';
import { PlayerHand } from './PlayerHand';
import { RoundResultOverlay } from './RoundResultOverlay';
import { RoundLog } from './RoundLog';

export function GameScreen({ gameState, myHand, myInfo, isMyTurn, onPlayCard, roundResult, error, playedCardId }) {
  const [showLog, setShowLog] = useState(false);

  if (!gameState) return (
    <div className="min-h-screen felt-texture flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-amber-400 text-5xl animate-float">🃏</div>
        <div className="text-white/50 font-display text-xl animate-pulse">Dealing cards...</div>
      </div>
    </div>
  );

  const players = gameState.players || [];
  const myId = myInfo?.playerId;
  const myIndex = players.findIndex(p => p.id === myId);

  // Assign positions: me=bottom, then left, top, right going clockwise
  const getPlayer = (offset) => players[(myIndex + offset) % players.length];
  const leftPlayer  = getPlayer(1);
  const topPlayer   = getPlayer(2);
  const rightPlayer = getPlayer(3);
  const myPlayer    = players[myIndex];

  const isPlayerTurn = (playerId) => gameState.currentPlayerId === playerId;
  const currentPlayerName = players.find(p => p.id === gameState.currentPlayerId)?.name;

  return (
    <div className="h-screen flex flex-col felt-texture relative overflow-hidden select-none">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 glass-panel border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-display font-bold">🃏 Bhabhi Thulla</span>
          <span className="text-white/20 text-xs font-mono hidden sm:block">
            Room: <span className="text-white/40">{gameState.roomId}</span>
          </span>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-display font-semibold transition-all
          ${isMyTurn
            ? 'bg-amber-500/30 border border-amber-400/60 text-amber-300 pulse-gold'
            : 'bg-white/5 border border-white/10 text-white/40'}`}>
          {isMyTurn ? '⚡ Your turn!' : `⏳ ${currentPlayerName || '...'}'s turn`}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs font-mono">Round {gameState.roundNumber}</span>
          <button
            onClick={() => setShowLog(v => !v)}
            className={`text-xs px-2 py-1 rounded border transition-colors font-display
              ${showLog
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}>
            📜 Log
          </button>
        </div>
      </div>

      {/* ERROR BAR */}
      {error && (
        <div className="bg-red-900/80 border-b border-red-500/30 px-4 py-2 text-center text-red-200 text-sm font-display z-10 shrink-0"
          style={{ animation: 'slideDown 0.2s ease-out' }}>
          ⚠️ {error}
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex min-h-0">

        {/* Round log sidebar */}
        {showLog && (
          <div className="w-64 shrink-0 glass-panel border-r border-white/5 flex flex-col p-3 gap-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-amber-400/70 font-display text-xs uppercase tracking-wider">Round Log</span>
              <button onClick={() => setShowLog(false)} className="text-white/30 hover:text-white/60 text-xs">✕</button>
            </div>
            <RoundLog roundHistory={gameState.roundHistory} players={players} />
            <div className="mt-auto pt-3 border-t border-white/10">
              <div className="text-amber-400/60 font-display text-xs uppercase tracking-wider mb-2">Scores</div>
              <div className="space-y-1.5">
                {players.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.id === myId ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <span className={`font-display ${p.id === myId ? 'text-amber-300' : 'text-white/60'} ${p.finished ? 'opacity-50' : ''}`}>
                        {p.name.substring(0, 10)}{p.finished ? ' ✅' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 font-mono">{p.cardCount}🃏</span>
                      {p.thullaCount > 0 && <span className="text-red-400 font-mono">🔥{p.thullaCount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playing field */}
        <div className="flex-1 flex flex-col items-center justify-between py-3 px-2 gap-2 min-h-0">

          {/* Top player */}
          <div className="shrink-0">
            <PlayerPanel player={topPlayer} isCurrentTurn={isPlayerTurn(topPlayer?.id)} isMe={false} position="top" />
          </div>

          {/* Middle row */}
          <div className="flex items-center justify-between w-full flex-1 gap-2 min-h-0">
            <div className="shrink-0 w-32">
              <PlayerPanel player={leftPlayer} isCurrentTurn={isPlayerTurn(leftPlayer?.id)} isMe={false} position="left" />
            </div>

            <div className="flex-1 flex items-center justify-center">
              <GameTable gameState={gameState} roundResult={roundResult} players={players} />
            </div>

            <div className="shrink-0 w-32">
              <PlayerPanel player={rightPlayer} isCurrentTurn={isPlayerTurn(rightPlayer?.id)} isMe={false} position="right" />
            </div>
          </div>

          {/* My area */}
          <div className="w-full shrink-0 flex flex-col items-center gap-2">
            <PlayerPanel player={myPlayer} isCurrentTurn={isMyTurn} isMe={true} position="bottom" />
            <PlayerHand
              hand={myHand}
              isMyTurn={isMyTurn}
              onPlayCard={onPlayCard}
              leadingSuit={gameState.leadingSuit}
              playedCardId={playedCardId}
            />
          </div>
        </div>
      </div>

      <RoundResultOverlay result={roundResult} players={players} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
