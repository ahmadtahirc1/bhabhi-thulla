import { useGame } from './hooks/useGame';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { WaitingScreen } from './components/lobby/WaitingScreen';
import { GameScreen } from './components/game/GameScreen';
import { GameOverScreen } from './components/game/GameOverScreen';
import { Notification } from './components/ui/Notification';
import { useSocket } from './context/SocketContext';

function ConnectionBanner({ connected }) {
  if (connected) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900 text-red-100 text-center text-sm py-2 font-display">
      ⚠️ Connecting to server...
    </div>
  );
}

export default function App() {
  const { connected } = useSocket();
  const {
    screen,
    myInfo,
    roomData,
    gameState,
    myHand,
    availableRooms,
    roundResult,
    gameOver,
    error,
    notification,
    isMyTurn,
    playedCardId,
    joinRoom,
    playCard,
    restartGame,
  } = useGame();

  return (
    <div className="min-h-screen">
      <ConnectionBanner connected={connected} />
      <Notification notification={notification} />

      {screen === 'lobby' && (
        <LobbyScreen
          onJoin={joinRoom}
          availableRooms={availableRooms}
          error={error}
        />
      )}

      {screen === 'waiting' && (
        <WaitingScreen
          roomData={roomData}
          myInfo={myInfo}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          gameState={gameState}
          myHand={myHand}
          myInfo={myInfo}
          isMyTurn={isMyTurn}
          onPlayCard={playCard}
          roundResult={roundResult}
          error={error}
          playedCardId={playedCardId}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          gameOver={gameOver}
          myInfo={myInfo}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
