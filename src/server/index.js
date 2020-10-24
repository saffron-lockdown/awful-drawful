import { Manager } from './manager.js';
import { createLogger } from './logger';
import { createServer } from 'http';
import express from 'express';
import serveStatic from 'serve-static';
import session from 'express-session';
import sio from 'socket.io';

const app = express();
const server = createServer(app);
const io = sio(server);

const sesh = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
});

const mgr = new Manager();

function addPlayerToGame(player, game) {
  // Add player if not in game
  if (!game.players.includes(player)) {
    player.leaveGame();

    // Record which game this player is in
    player.joinGame(game);

    // Add player reference in game
    game.addPlayer(player);
  }

  game.emit('set-player-list', game.listPlayers());
}

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(sesh);
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const { session: user } = socket.request;
  const log = createLogger(user.id);
  log('User connected');

  const player = mgr.getOrCreatePlayer(user.id);
  player.setSocket(socket);

  // If the player is in a game, update the list of players on everyones screen
  if (player.game) {
    player.game.update();
  }

  socket.on('set-name', (name) => {
    log(`nice name - ${name}`);
    player.setName(name);

    // If the player is in a game, update the list of players on everyones screen
    if (player.game) {
      player.game.update();
    }
  });

  socket.on('create-game', () => {
    const game = mgr.createGame();

    addPlayerToGame(player, game);
  });

  socket.on('join-game', (gameId) => {
    const game = mgr.getGame(gameId);
    if (!game) {
      player.setError('game does not exist');
      return;
    }

    addPlayerToGame(player, game);
  });

  socket.on('leave-game', () => {
    player.leaveGame();
  });

  socket.on('post-drawing', (drawing) => {
    player.game.emit('update-feed', drawing);
  });
});

app.use(serveStatic('src/client/'));

const log = createLogger();

server.listen(3000, () => {
  log('listening on http://localhost:3000');
});
