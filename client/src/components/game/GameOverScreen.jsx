export function GameOverScreen({ gameOver, myInfo, onRestart }) {
  if (!gameOver) return null;

  const { loserName, loserId, finalScores, message } = gameOver;
  const isLoser = loserId === myInfo?.playerId;

  const sortedPlayers = Object.entries(finalScores || {})
    .sort(([,a], [,b]) => a.finishPosition - b.finishPosition || b.cardsCollected - a.cardsCollected);

  const medalEmoji = ['🥇', '🥈', '🥉', '💀'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center felt-texture relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {['♠','♥','♦','♣'].map((s,i) => (
          <div key={i} className="absolute text-white/4 font-display font-bold select-none"
            style={{ fontSize: '18vw', top:`${[8,55,20,70][i]}%`, left:`${[5,72,38,12][i]}%`,
              transform:`rotate(${[-15,10,-5,20][i]}deg)` }}>
            {s}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* Header */}
        <div className="mb-8" style={{ animation: 'slideDown 0.5s ease-out' }}>
          <div className="text-6xl mb-4">{isLoser ? '😰' : '🎉'}</div>
          <h1 className="font-display text-4xl font-extrabold gold-text mb-2">Game Over!</h1>
          <p className="text-white/70 font-body text-lg">{message}</p>
          {isLoser && (
            <p className="text-red-400 font-display text-xl mt-2 font-bold">You are the Bhabhi! 😅</p>
          )}
          {!isLoser && (
            <p className="text-emerald-400 font-display text-xl mt-2 font-bold">You escaped! 🎊</p>
          )}
        </div>

        {/* Scoreboard */}
        <div className="glass-panel rounded-2xl p-6 mb-6" style={{ animation: 'slideDown 0.5s ease-out 0.1s both' }}>
          <h2 className="font-display text-amber-400/80 text-sm uppercase tracking-widest mb-4">Final Standings</h2>
          <div className="space-y-3">
            {sortedPlayers.map(([playerId, data], index) => {
              const isMe = playerId === myInfo?.playerId;
              const isThisLoser = playerId === loserId;
              const medal = isThisLoser ? '💀' : medalEmoji[data.finishPosition - 1] || '✅';

              return (
                <div key={playerId}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all
                    ${isThisLoser ? 'bg-red-900/30 border-red-500/40' : isMe ? 'bg-amber-500/10 border-amber-400/30' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-2xl w-8">{medal}</span>
                  <div className="flex-1 text-left">
                    <div className={`font-display font-semibold ${isMe ? 'text-amber-300' : 'text-white'}`}>
                      {data.name}{isMe ? ' (You)' : ''}
                    </div>
                    <div className="text-white/40 text-xs font-body">
                      {data.thullaCount} Thulla{data.thullaCount !== 1 ? 's' : ''} · {data.cardsCollected} cards collected
                    </div>
                  </div>
                  <div className={`text-xs font-display font-bold px-2 py-1 rounded-full
                    ${isThisLoser ? 'bg-red-800 text-red-200' : 'bg-emerald-800/50 text-emerald-300'}`}>
                    {isThisLoser ? 'BHABHI' : `#${data.finishPosition || index + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3" style={{ animation: 'slideDown 0.5s ease-out 0.2s both' }}>
          <button onClick={onRestart} className="flex-1 btn-primary">
            🔄 Play Again
          </button>
          <button onClick={() => window.location.reload()} className="flex-1 btn-secondary">
            🚪 Leave
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
