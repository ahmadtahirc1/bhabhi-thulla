import { PlayingCard } from '../ui/PlayingCard';
import { getSuitSymbol } from '../../utils/cardHelpers';

export function RoundResultOverlay({ result, players }) {
  if (!result) return null;

  const getPlayerName = (id) => players?.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className={`
          rounded-2xl px-8 py-5 text-center shadow-2xl border
          ${result.isThulla
            ? 'bg-red-900/95 border-red-400/60'
            : 'bg-emerald-900/95 border-emerald-500/60'}
        `}
        style={{ animation: 'slideDown 0.3s ease-out, fadeOut 0.5s ease-in 2.2s forwards' }}
      >
        {result.isThulla ? (
          <>
            <div className="text-4xl mb-1" style={{ animation: 'thulla 0.8s ease-out' }}>🔥</div>
            <div className="font-display text-2xl font-bold text-red-300 mb-0.5">THULLA!</div>
            <div className="text-red-200/70 text-sm font-body mb-1">
              <span className="font-semibold text-red-200">{result.brokenByName}</span> had no {getSuitSymbol(result.leadingSuit)} {result.leadingSuit}
            </div>
            <div className="text-red-300/80 text-sm font-body">
              Round ended early — {result.earlyEnd && 'only ' + result.plays?.length + ' cards played'}
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl mb-1">✨</div>
            <div className="font-display text-xl font-bold text-emerald-300 mb-0.5">Round Complete!</div>
          </>
        )}

        {/* Winner card + penalty info */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <PlayingCard card={result.winningCard} size="sm" />
          <div className="text-left">
            <div className="text-white font-display font-semibold">{result.winnerName}</div>
            <div className="text-white/50 text-xs font-body">
              {getSuitSymbol(result.leadingSuit)} highest {result.leadingSuit}
            </div>
            {/* Penalty card count — only shown on THULLA */}
            {result.isThulla && (
              <div className="text-xs font-display font-semibold mt-0.5 text-red-300">
                +{result.penaltyCardCount} cards → hand
              </div>
            )}
          </div>
        </div>

        {/* Who broke suit */}
        {result.isThulla && result.brokenByName && (
          <div className="mt-2 text-red-300/70 text-xs font-body">
            💔 {result.brokenByName} broke suit
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeOut {
          to { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
