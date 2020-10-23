import { createServer } from 'http';
import express from 'express';
import serveStatic from 'serve-static';
import session from 'express-session';
import sio from 'socket.io';
import { Manager } from './manager.js';

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

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(sesh);
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const { session: user } = socket.request;
  console.log(`User ${user.id.substring(1, 6)}... connected`);

  const player = mgr.getOrCreatePlayer(user.id);
  player.socket = socket;

  socket.on('set-name', (name) => {
    console.log(`nice name - ${name}`);
    player.name = name;
    player.update();

    // If the player is in a game, update the list of players on everyones screen
    if (player.gameId) {
      mgr.messageGame(
        player.gameId,
        'set-player-list',
        mgr.listPlayersInGame(player.gameId)
      );
    }
  });

  socket.on('join-room', (gameId) => {
    // TODO: if player is already in game, then leave it

    // Record which game this player is in
    player.gameId = gameId;
    player.update();

    // Create game if doesn't exist
    const game = mgr.getOrCreateGame(gameId);

    // Add user if not in game
    if (!game.players.includes(player.id)) {
      game.addPlayer(player.id);
    }

    // Update list of player names
    mgr.messageGame(gameId, 'set-player-list', mgr.listPlayersInGame(gameId));
  });

  socket.on('post-drawing', (drawing) => {
    mgr.messageGame(player.gameId, 'update-feed', drawing);
  });
});

app.use(serveStatic('src/client/'));

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
