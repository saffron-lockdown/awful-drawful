import { Game } from './game.js';
import { Player } from './player.js';

function mockPlayer(name) {
  const player = new Player(`MOCK_${name}`);
  const mockSocket = {
    emit: jest.fn(),
  };
  player.setSocket(mockSocket);
  player.setName(name);
  return player;
}

test('initialise and start game', () => {
  const game = new Game(101);
  game.addPlayer(mockPlayer('tom'));
  game.addPlayer(mockPlayer('wz'));

  expect(game.getPlayers()).toEqual([
    { name: 'tom', connected: true },
    { name: 'wz', connected: true },
  ]);

  game.start();
  expect(game.gameplan.length).toBe(3);
  expect(Object.keys(game.gameplan[0]).length).toBe(2);
});
