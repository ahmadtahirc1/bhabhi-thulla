import { getSuitSymbol, getSuitColor, isRedSuit } from '../../utils/cardHelpers';

export function PlayingCard({ card, onClick, playable = false, selected = false, size = 'md', faceDown = false, className = '' }) {
  const sizeClasses = {
    sm: 'w-12 h-17',
    md: 'w-[70px] h-[100px]',
    lg: 'w-[80px] h-[115px]',
    xl: 'w-[90px] h-[130px]',
  };

  const dimStyle = {
    sm: { width: 48, height: 68 },
    md: { width: 70, height: 100 },
    lg: { width: 80, height: 115 },
    xl: { width: 90, height: 130 },
  }[size] || { width: 70, height: 100 };

  if (faceDown) {
    return (
      <div
        style={dimStyle}
        className={`rounded-lg card-back card-shadow flex items-center justify-center ${className}`}
      >
        <div className="w-[80%] h-[80%] rounded border border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-lg">🂠</span>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const color = getSuitColor(card.suit);
  const symbol = getSuitSymbol(card.suit);
  const red = isRedSuit(card.suit);

  const fontSize = {
    sm: { rank: 11, suit: 10 },
    md: { rank: 14, suit: 13 },
    lg: { rank: 16, suit: 15 },
    xl: { rank: 18, suit: 17 },
  }[size] || { rank: 14, suit: 13 };

  return (
    <div
      onClick={playable && onClick ? onClick : undefined}
      style={{
        ...dimStyle,
        cursor: playable && onClick ? 'pointer' : 'default',
        color,
        background: 'white',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4px 5px',
        userSelect: 'none',
        boxShadow: selected
          ? `0 0 0 3px #f59e0b, 0 4px 12px rgba(0,0,0,0.4)`
          : '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
        transform: selected ? 'translateY(-16px) scale(1.05)' : undefined,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        outline: playable ? '2px solid rgba(245,158,11,0.3)' : 'none',
        outlineOffset: 2,
      }}
      className={`${playable ? 'card-hover' : ''} ${className}`}
    >
      {/* Top left */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: fontSize.rank }}>{card.rank}</span>
        <span style={{ fontSize: fontSize.suit, lineHeight: 1 }}>{symbol}</span>
      </div>

      {/* Center suit */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: fontSize.suit + 8, lineHeight: 1 }}>
        {symbol}
      </div>

      {/* Bottom right (rotated) */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, transform: 'rotate(180deg)', alignSelf: 'flex-end' }}>
        <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: fontSize.rank }}>{card.rank}</span>
        <span style={{ fontSize: fontSize.suit, lineHeight: 1 }}>{symbol}</span>
      </div>
    </div>
  );
}

export function CardBack({ size = 'md', className = '' }) {
  const dimStyle = {
    sm: { width: 48, height: 68 },
    md: { width: 70, height: 100 },
    lg: { width: 80, height: 115 },
    xl: { width: 90, height: 130 },
  }[size] || { width: 70, height: 100 };

  return (
    <div
      style={dimStyle}
      className={`rounded-lg card-back card-shadow flex items-center justify-center ${className}`}
    >
      <div className="rounded border border-white/10 flex items-center justify-center"
        style={{ width: '80%', height: '80%' }}>
        <div className="text-white/20" style={{ fontSize: 20 }}>✦</div>
      </div>
    </div>
  );
}
