import { PlayingCard } from '../ui/PlayingCard';
import { getSuitSymbol } from '../../utils/cardHelpers';

const POSITION_STYLES = {
  0: 'top-2 left-1/2 -translate-x-1/2',   // top
  1: 'left-2 top-1/2 -translate-y-1/2',   // left
  2: 'bottom-2 left-1/2 -translate-x-1/2', // bottom
  3: 'right-2 top-1/2 -translate-y-1/2',  // right
};

export function GameTable({ gameState, roundResult, players }) {
  const currentRound = gameState?.currentRound || [];
  const leadingSuit  = gameState?.leadingSuit;

  const getPlayerName = (playerId) =>
    players?.find(p => p.id === playerId)?.name || '?';

  // Map each played card to a position based on order played
  // The first card played = position 0 (wherever), subsequent at 1,2,3
  // For visual clarity, we just place them in a 2x2 grid inside the table

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Felt table circle */}
      <div
        className="relative rounded-full table-border flex items-center justify-center overflow-hidden"
        style={{
          width: 280,
          height: 280,
          background: 'radial-gradient(ellipse at 35% 35%, #1a6636 0%, #0d3b22 55%, #052e16 100%)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.04)',
        }}
      >
        {/* Subtle felt grain */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'3\' height=\'3\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'0.5\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '3px 3px' }} />

        {/* Leading suit badge */}
        {leadingSuit && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="glass-panel rounded-full px-3 py-0.5 flex items-center gap-1.5 border border-amber-400/20">
              <span className="text-amber-400/60 text-xs font-display">Lead</span>
              <span className={`text-base leading-none ${leadingSuit === 'hearts' || leadingSuit === 'diamonds' ? 'text-red-400' : 'text-white'}`}>
                {getSuitSymbol(leadingSuit)}
              </span>
              <span className="text-white/50 text-xs capitalize">{leadingSuit}</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {currentRound.length === 0 && !roundResult && (
          <div className="flex flex-col items-center gap-2 text-center px-8">
            <div className="text-white/10 text-5xl">♠</div>
            <div className="text-white/20 font-display text-sm">
              {gameState?.state === 'playing' ? 'Waiting for first card...' : ''}
            </div>
          </div>
        )}

        {/* Cards on table — 2×2 grid layout */}
        {currentRound.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-4 mt-4">
            {currentRound.map(({ playerId, card }, i) => (
              <div key={playerId} className="flex flex-col items-center gap-1"
                style={{ animation: `deal 0.25s ease-out ${i * 60}ms both` }}>
                <PlayingCard card={card} size="sm" />
                <span className="text-white/40 font-body text-xs leading-none truncate max-w-[55px] text-center">
                  {getPlayerName(playerId)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* THULLA flash */}
        {roundResult?.isThulla && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.35) 0%, transparent 70%)' }}>
            <span className="font-display font-black text-red-300 text-xl drop-shadow-lg"
              style={{ animation: 'thulla 0.8s ease-out', textShadow: '0 0 20px rgba(239,68,68,0.8)' }}>
              THULLA! 🔥
            </span>
          </div>
        )}

        {/* Round number at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="text-white/15 font-mono text-xs">
            {gameState?.roundNumber > 0 ? `Round ${gameState.roundNumber}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
