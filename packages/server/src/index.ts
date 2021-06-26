import { Caption } from './caption';
import { Manager } from './manager';
import Redis from 'ioredis';
import { TEST_GAME_ID } from './constants';
import { createLogger } from './logger';
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import proxy from 'express-http-proxy';
import serveStatic from 'serve-static';
import sio from 'socket.io';
import { useSession } from './middleware/session';

const IS_PROD = process.env.ENV === 'production';

const log = createLogger();
const app = express();
const server = createServer(app);
const io = sio(server);
const redisClient = IS_PROD ? new Redis(process.env.REDIS_URL) : undefined;

useSession(app, io, redisClient);

if (IS_PROD) {
  log('running in production');
  app.use(serveStatic(path.join(__dirname, '../../client/dist')));
} else {
  log('running in development');
  app.use('/', proxy('http://localhost:3001'));
}

const mgr = new Manager();

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

const port = process.env.PORT || 3000;

server.listen(port, () => {
  log(`listening on http://localhost:${port}`);
});
