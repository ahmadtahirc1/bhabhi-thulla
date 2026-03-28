import { CardBack } from '../ui/PlayingCard';

export function PlayerPanel({ player, isCurrentTurn, isMe, position }) {
  if (!player) return null;

  const positionLabels = {
    top: 'Across',
    left: 'Left',
    right: 'Right',
    bottom: 'You',
  };

  const cardCount = player.cardCount || 0;
  const finished = player.finished;

  return (
    <div className={`flex flex-col items-center gap-2 ${position === 'bottom' ? 'scale-110' : ''}`}>
      {/* Name badge */}
      <div className={`px-3 py-1.5 rounded-full border text-sm font-display font-semibold flex items-center gap-2 transition-all
        ${isCurrentTurn && !finished
          ? 'bg-amber-500/20 border-amber-400/70 text-amber-300 pulse-gold'
          : isMe
            ? 'bg-emerald-800/40 border-emerald-500/40 text-emerald-300'
            : 'bg-white/5 border-white/10 text-white/70'
        }
        ${finished ? 'opacity-50 line-through' : ''}
      `}>
        {isCurrentTurn && !finished && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        )}
        <span>{player.name}</span>
        {isMe && <span className="text-xs opacity-60">(You)</span>}
        {finished && <span className="text-xs ml-1">✅ Done</span>}
      </div>

      {/* Card count */}
      <div className="flex items-center gap-1.5">
        {/* Stacked card backs for non-me players */}
        {!isMe && cardCount > 0 && (
          <div className="relative flex">
            {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? -45 : 0, zIndex: i, position: 'relative' }}>
                <CardBack size="sm" />
              </div>
            ))}
          </div>
        )}
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full
          ${cardCount === 0 ? 'bg-red-900/50 text-red-300' : 'bg-white/10 text-white/60'}`}>
          {cardCount} cards
        </span>
      </div>

      {/* Thulla count */}
      {player.thullaCount > 0 && (
        <div className="text-xs text-amber-400 font-display">
          🔥 {player.thullaCount} Thulla{player.thullaCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
