import { createServer } from 'http';
import express from 'express';
import { getPrompt } from './prompt.js';
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

const users = {};

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

app.use(sesh);
io.use(wrap(sesh));

io.on('connect', (socket) => {
  const { session: user } = socket.request;

  const prompt = getPrompt();
  socket.emit('set-prompt', prompt);
  socket.emit('set-name', user.name || 'no name set');

  // reconnect to room
  if (user.roomId) {
    socket.join(user.roomId);
    socket.emit('set-room-id', user.roomId);
  }

  socket.on('set-name', (name) => {
    user.name = name;
    user.socketId = socket.id;
    user.save((err) => {
      if (err) {
        throw err;
      }
      socket.emit('set-name', socket.request.session.name);
    });
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    user.roomId = roomId;
    user.save((err) => {
      if (err) {
        throw err;
      }
      socket.emit('set-room-id', user.roomId);
    });
  });

  socket.on('post-drawing', (drawing) => {
    io.to(user.roomId).emit('update-feed', drawing);
  });
});

app.use(serveStatic('src/client/'));

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
