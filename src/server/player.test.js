import { Player } from './player';

test('should send message to socket', () => {
  const player = new Player('MOCK_ID');
  const mockSocket = {
    emit: jest.fn(),
  };
  player.setSocket(mockSocket);
  expect(mockSocket.emit).toHaveBeenCalledWith('sync', {
    name: '',
    errorMessage: null,
    prompt: null,
    viewDrawing: null,
    isWaiting: false,
    gameId: null,
    playerList: null,
    timeRemaining: null,
    phase: null,
  });
});
