import { Player } from './player';

test('should send message to socket', () => {
  const player = new Player('MOCK_ID');
  const mockSocket = {
    emit: jest.fn(),
  };
  player.setSocket(mockSocket);
  expect(mockSocket.emit).toHaveBeenCalledWith('sync', {
    name: 'No name set',
    errorMessage: null,
    prompt: null,
    viewDrawing: null,
    gameId: undefined,
    playerList: null,
  });
});
