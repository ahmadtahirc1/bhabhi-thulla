export function WaitingScreen({ roomData, myInfo }) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomData?.roomId || '');
  };

  const players = roomData?.players || [];
  const needed = 4 - players.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center felt-texture relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {['♠','♥','♦','♣'].map((s,i) => (
          <div key={i} className="absolute text-white/3 font-display font-bold select-none"
            style={{ fontSize: '18vw', top:`${[10,55,25,70][i]}%`, left:`${[5,70,40,15][i]}%`,
              transform:`rotate(${[-12,8,-4,18][i]}deg)`, animation:`float ${3+i}s ease-in-out infinite`, animationDelay:`${i*0.6}s` }}>
            {s}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        <h1 className="font-display text-4xl font-extrabold gold-text mb-2">Waiting Room</h1>
        <p className="text-emerald-400/70 font-body italic mb-8">Waiting for players to join...</p>

        {/* Room code */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <p className="text-amber-300/70 font-display text-xs uppercase tracking-widest mb-2">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-4xl font-bold text-white tracking-widest">{roomData?.roomId}</span>
            <button onClick={copyRoomCode}
              className="text-amber-400/60 hover:text-amber-300 transition-colors text-lg"
              title="Copy room code">
              📋
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2 font-body">Share this code with friends</p>
        </div>

        {/* Player slots */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <p className="text-amber-300/70 font-display text-xs uppercase tracking-widest mb-4">
            Players ({players.length}/4)
          </p>
          <div className="space-y-2">
            {[0,1,2,3].map(i => {
              const player = players[i];
              const isMe = player?.id === myInfo?.playerId;
              return (
                <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-3 border transition-all
                  ${player
                    ? isMe
                      ? 'bg-amber-500/10 border-amber-400/40'
                      : 'bg-white/5 border-white/10'
                    : 'bg-white/2 border-white/5 opacity-40'
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${player ? isMe ? 'bg-amber-500 text-stone-900' : 'bg-emerald-700 text-white' : 'bg-white/10 text-white/30'}`}>
                    {player ? player.name[0].toUpperCase() : i+1}
                  </div>
                  <span className={`font-display ${player ? isMe ? 'text-amber-300' : 'text-white' : 'text-white/20'}`}>
                    {player ? player.name + (isMe ? ' (You)' : '') : `Waiting for player ${i+1}...`}
                  </span>
                  {player && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-white/50 font-body text-sm">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-400"
                style={{ animation: `bounce 1.2s ease-in-out infinite`, animationDelay: `${i*0.2}s` }} />
            ))}
          </div>
          <span>Waiting for {needed} more player{needed !== 1 ? 's' : ''}...</span>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
