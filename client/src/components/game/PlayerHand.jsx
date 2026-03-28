import { useState } from 'react';
import { PlayingCard } from '../ui/PlayingCard';
import { sortHand, getSuitSymbol } from '../../utils/cardHelpers';

export function PlayerHand({ hand, isMyTurn, onPlayCard, leadingSuit, playedCardId }) {
  const [hoveredId, setHoveredId] = useState(null);

  const sortedHand = sortHand(hand);
  const total = sortedHand.length;

  const hasSuit = (suit) => hand.some(c => c.suit === suit);
  const mustFollowSuit = leadingSuit && hasSuit(leadingSuit);

  const canPlay = (card) => {
    if (!isMyTurn) return false;
    if (mustFollowSuit && card.suit !== leadingSuit) return false;
    return true;
  };

  // Fan overlap: tighter when more cards
  const overlap = total <= 6 ? 16 : total <= 9 ? 28 : total <= 11 ? 38 : 44;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Turn status pill */}
      <div className={`px-4 py-1.5 rounded-full text-sm font-display font-semibold transition-all duration-300
        ${isMyTurn
          ? 'bg-amber-500/25 border border-amber-400/50 text-amber-300 pulse-gold'
          : 'bg-white/5 border border-white/10 text-white/40'}`}>
        {isMyTurn
          ? mustFollowSuit
            ? `⚡ Play a ${leadingSuit} ${getSuitSymbol(leadingSuit)} card`
            : '⚡ Your turn — play any card'
          : '⏳ Waiting for your turn...'}
      </div>

      {/* Cards fan */}
      <div className="flex items-end justify-center pb-2 px-2" style={{ minHeight: 124 }}>
        {total === 0 ? (
          <div className="text-white/20 font-display text-sm italic">No cards — waiting for next round</div>
        ) : (
          <div className="flex items-end" style={{ position: 'relative' }}>
            {sortedHand.map((card, i) => {
              const playable  = canPlay(card);
              const isHovered = hoveredId === card.id;
              const isPlaying = playedCardId === card.id;
              const dimmed    = isMyTurn && !playable;

              return (
                <div
                  key={card.id}
                  style={{
                    marginLeft: i > 0 ? -overlap : 0,
                    zIndex: isHovered ? 200 : i + 1,
                    position: 'relative',
                    transition: 'transform 0.15s ease',
                    transform: isPlaying
                      ? 'translateY(-70px) scale(1.08)'
                      : isHovered && playable
                        ? 'translateY(-20px) scale(1.05)'
                        : dimmed
                          ? 'translateY(6px)'
                          : 'translateY(0)',
                    opacity: dimmed ? 0.4 : 1,
                    filter: dimmed ? 'grayscale(0.3)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredId(card.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <PlayingCard
                    card={card}
                    size="lg"
                    playable={playable && !isPlaying}
                    onClick={() => playable && !isPlaying && onPlayCard(card.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-white/25 text-xs font-mono">
        {total} card{total !== 1 ? 's' : ''} in hand
      </div>
    </div>
  );
}
