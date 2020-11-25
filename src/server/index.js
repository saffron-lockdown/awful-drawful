import { Caption } from './caption';
import { Manager } from './manager';
import { createLogger } from './logger';
import { createServer } from 'http';
import express from 'express';
import path from 'path';
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

// attach session middleware to app so that cookies are set on page GETs
app.use(sesh);

// also attach to session middleware to make the session available on socket.request
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const { session: user } = socket.request;
  const log = createLogger(user.id);
  log(`User connected with socket.id: ${socket.id}`);

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
    player.startGame();
  });

  socket.on('post-drawing', (drawing) => {
    player.postDrawing(drawing);
  });

  socket.on('post-caption', (text) => {
    const caption = new Caption(player, text);
    player.postCaption(caption);
  });

  socket.on('choose-caption', (text) => {
    player.chooseCaption(text);
  });

  socket.on('disconnect', () => {
    player.log('disconnected');
    player.setSocket(null);
  });
});
app.use(serveStatic(path.join(__dirname, '../client')));

const log = createLogger();

const port = process.env.PORT || 3000;

server.listen(port, () => {
  log(`listening on http://localhost:${port}`);
});
