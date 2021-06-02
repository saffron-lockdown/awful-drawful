import { Caption } from './caption';
import { Manager } from './manager';
import { TEST_GAME_ID } from './constants';
import { createLogger } from './logger';
import { createServer } from 'http';
import express, { RequestHandler, Response } from 'express';
import path from 'path';
import proxy from 'express-http-proxy';
import serveStatic from 'serve-static';
import session from 'express-session';
import sio, { Socket } from 'socket.io';

const app = express();
const server = createServer(app);
const io = sio(server);

const sesh = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false },
});

const mgr = new Manager();

const wrap = (
  middleware: RequestHandler
): ((socket: Socket, fn: (err?: any) => void) => void) => {
  return (socket, next) => middleware(socket.request, {} as Response, next);
};

// attach session middleware to app so that cookies are set on page GETs
app.use(sesh);

// also attach to session middleware to make the session available on socket.request
io.use(wrap(sesh));

// for testing always create TEST_GAME_ID room
mgr.createGame(TEST_GAME_ID);

const withAck = ({ error }: { error?: string }, ack: CallableFunction) => {
  if (error) {
    ack({ error });
  }
};

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

    mgr.addPlayerToGame(player, game.getId());
  });

  socket.on('join-game', (gameId: string, ack: Function) => {
    const game = mgr.getGame(gameId);
    if (!game) {
      ack({ error: 'game does not exist' });
      return;
    }

    mgr.addPlayerToGame(player, game.getId());
  });

  socket.on('leave-game', () => {
    mgr.removePlayer(player);
  });

  socket.on('start-game', () => {
    player.startGame();
  });

  socket.on('post-drawing', (drawing: string, ack) => {
    withAck(player.postDrawing(drawing), ack);
  });

  socket.on('post-caption', (text, ack) => {
    if (!text.length || /^\s+$/.test(text)) {
      ack({ error: "can't submit empty caption!" });
      return;
    }
    const caption = new Caption(player, text);
    withAck(player.postCaption(caption), ack);
  });

  socket.on('choose-caption', (text, ack) => {
    withAck(player.chooseCaption(text), ack);
  });

  socket.on('disconnect', () => {
    player.log('disconnected');
    player.setSocket(null);
  });
});

const log = createLogger();

if (process.env.ENV === 'production') {
  log('running in production');
  app.use(serveStatic(path.join(__dirname, '../../client/dist')));
} else {
  log('running in development');
  app.use('/', proxy('http://localhost:3001'));
}

const port = process.env.PORT || 3000;

server.listen(port, () => {
  log(`listening on http://localhost:${port}`);
});
