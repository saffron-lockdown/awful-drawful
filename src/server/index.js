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

    // Add game reference to player
    player.joinGame(game);
  }
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

  socket.on('set-name', (name) => {
    log(`nice name - ${name}`);
    player.setName(name);
  });

  socket.on('create-game', () => {
    const game = mgr.createGame();

    addPlayerToGame(player, game);
  });

  socket.on('join-game', (gameId) => {
    const game = mgr.getGame(gameId);
    if (!game) {
      player.sendError('game does not exist');
      return;
    }

    addPlayerToGame(player, game);
  });

  socket.on('leave-game', () => {
    player.leaveGame();
  });

  socket.on('start-game', () => {
    player.game.start();
  });

  socket.on('post-drawing', (drawing) => {
    player.postDrawing(drawing);
  });
});

app.use(serveStatic('src/client/'));

const log = createLogger();

server.listen(3000, () => {
  log('listening on http://localhost:3000');
});
