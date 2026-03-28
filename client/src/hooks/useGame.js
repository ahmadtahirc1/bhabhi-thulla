import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export function useGame() {
  const { socket } = useSocket();

  const [screen, setScreen]             = useState('lobby');
  const [myInfo, setMyInfo]             = useState(null);
  const [roomData, setRoomData]         = useState(null);
  const [gameState, setGameState]       = useState(null);
  const [myHand, setMyHand]             = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roundResult, setRoundResult]   = useState(null);
  const [gameOver, setGameOver]         = useState(null);
  const [error, setError]               = useState(null);
  const [notification, setNotification] = useState(null);
  const [playedCardId, setPlayedCardId] = useState(null);

  const notifTimer  = useRef(null);
  const roundTimer  = useRef(null);
  const errorTimer  = useRef(null);

  const showNotification = useCallback((msg, type = 'info') => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotification({ msg, type });
    notifTimer.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  // Attach socket listeners — re-runs whenever socket changes (null → instance)
  useEffect(() => {
    if (!socket) return;

    const onAvailableRooms = (rooms) => setAvailableRooms(rooms);

    const onJoined = (info) => {
      setMyInfo(info);
      setScreen('waiting');
      setError(null);
    };

    const onJoinError = ({ error }) => setError(error);

    const onRoomUpdate = (data) => {
      setRoomData(data);
      // Only push back to waiting if we're not already in game/gameover
      setScreen(prev => (prev === 'game' || prev === 'gameover') ? prev : 'waiting');
    };

    const onGameStart = ({ message, publicState }) => {
      setGameState(publicState);
      setScreen('game');
      setRoundResult(null);
      setGameOver(null);
      setPlayedCardId(null);
      showNotification(message, 'success');
    };

    const onYourCards = ({ hand }) => setMyHand(hand);

    const onGameState = (state) => {
      setGameState(state);
      setPlayedCardId(null);
    };

    const onRoundResult = (result) => {
      if (roundTimer.current) clearTimeout(roundTimer.current);
      setRoundResult(result);
      if (result.isThulla) {
        showNotification(
          `🔥 THULLA! ${result.brokenByName} had no ${result.leadingSuit} — ${result.winnerName} gets +${result.penaltyCardCount} cards!`,
          'thulla'
        );
      } else {
        showNotification(`✨ ${result.winnerName} wins the round — cards discarded`, 'win');
      }
      roundTimer.current = setTimeout(() => setRoundResult(null), 2500);
    };

    const onGameOver = (data) => {
      setGameOver(data);
      setScreen('gameover');
    };

    const onPlayError = ({ error }) => {
      setError(error);
      setPlayedCardId(null);
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setError(null), 3000);
    };

    const onPlayerLeft = ({ message }) => showNotification(message, 'warning');

    const onGameError = ({ error }) => showNotification(`⚠️ ${error}`, 'error');

    socket.on('availableRooms', onAvailableRooms);
    socket.on('joined',         onJoined);
    socket.on('joinError',      onJoinError);
    socket.on('roomUpdate',     onRoomUpdate);
    socket.on('gameStart',      onGameStart);
    socket.on('yourCards',      onYourCards);
    socket.on('gameState',      onGameState);
    socket.on('roundResult',    onRoundResult);
    socket.on('gameOver',       onGameOver);
    socket.on('playError',      onPlayError);
    socket.on('playerLeft',     onPlayerLeft);
    socket.on('gameError',      onGameError);

    return () => {
      socket.off('availableRooms', onAvailableRooms);
      socket.off('joined',         onJoined);
      socket.off('joinError',      onJoinError);
      socket.off('roomUpdate',     onRoomUpdate);
      socket.off('gameStart',      onGameStart);
      socket.off('yourCards',      onYourCards);
      socket.off('gameState',      onGameState);
      socket.off('roundResult',    onRoundResult);
      socket.off('gameOver',       onGameOver);
      socket.off('playError',      onPlayError);
      socket.off('playerLeft',     onPlayerLeft);
      socket.off('gameError',      onGameError);
    };
  }, [socket, showNotification]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(notifTimer.current);
      clearTimeout(roundTimer.current);
      clearTimeout(errorTimer.current);
    };
  }, []);

  const joinRoom = useCallback((roomId, playerName) => {
    if (!socket) return;
    setError(null);
    socket.emit('joinRoom', { roomId: roomId.trim().toUpperCase(), playerName: playerName.trim() });
  }, [socket]);

  const playCard = useCallback((cardId) => {
    if (!socket) return;
    setPlayedCardId(cardId);
    socket.emit('playCard', { cardId });
  }, [socket]);

  const restartGame = useCallback(() => {
    if (!socket) return;
    socket.emit('restartGame');
    setGameOver(null);
    setRoundResult(null);
    setMyHand([]);
    setGameState(null);
    setPlayedCardId(null);
  }, [socket]);

  const isMyTurn     = gameState?.currentPlayerId === myInfo?.playerId;
  const myPlayerData = gameState?.players?.find(p => p.id === myInfo?.playerId);

  return {
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
    myPlayerData,
    playedCardId,
    joinRoom,
    playCard,
    restartGame,
  };
}
