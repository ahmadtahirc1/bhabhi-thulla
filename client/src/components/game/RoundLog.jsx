import { getSuitSymbol } from '../../utils/cardHelpers';

function CardChip({ card }) {
  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-white"
      style={{ color: red ? '#dc2626' : '#1c1917', fontSize: 11 }}
    >
      {card.rank}{getSuitSymbol(card.suit)}
    </span>
  );
}

export function RoundLog({ roundHistory, players }) {
  if (!roundHistory || roundHistory.length === 0) return null;

  const getName = (id) => players?.find(p => p.id === id)?.name?.substring(0, 8) || '?';

  return (
    <div
      className="flex flex-col gap-1 w-full max-h-40 overflow-y-auto pr-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
    >
      {roundHistory.map((r, i) => (
        <div
          key={r.roundNumber}
          className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs border
            ${r.isThulla
              ? 'bg-red-900/30 border-red-500/20'
              : 'bg-white/5 border-white/5'}
            ${i === 0 ? 'opacity-100' : 'opacity-55'}
          `}
        >
          <span className="text-white/30 font-mono w-5 shrink-0">#{r.roundNumber}</span>

          {/* Cards played */}
          <div className="flex flex-wrap gap-1 flex-1">
            {r.plays?.map(({ playerId, card }) => (
              <div key={playerId} className="flex items-center gap-0.5">
                <CardChip card={card} />
                <span className="text-white/25" style={{ fontSize: 10 }}>{getName(playerId)}</span>
              </div>
            ))}
            {r.earlyEnd && (
              <span className="text-red-400/70 italic" style={{ fontSize: 10 }}>early end</span>
            )}
          </div>

          {/* Winner + penalty */}
          <div className="flex flex-col items-end shrink-0 gap-0.5">
            <span className="text-emerald-400 font-display" style={{ fontSize: 10 }}>
              ✓ {getName(r.winnerId)}
            </span>
            <span className="text-amber-400/60 font-mono" style={{ fontSize: 10 }}>
              +{r.penaltyCardCount}🃏
            </span>
            {r.isThulla && (
              <span className="text-red-400 font-bold" style={{ fontSize: 10 }}>🔥 THULLA</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
