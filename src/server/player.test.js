import { Player } from './player';

test('should send message to socket', () => {
  const player = new Player('MOCK_ID');
  const mockSocket = {
    emit: jest.fn(),
  };
  player.setSocket(mockSocket);
  expect(mockSocket.emit).toHaveBeenCalledWith('sync', {
    name: '',
    gameId: null,
    players: null,
    scores: null,
    timeRemaining: null,
    timerDuration: null,
    phase: null,
    isWaiting: null,
    prompt: null,
    viewDrawing: null,
    captions: null,
  });
});
