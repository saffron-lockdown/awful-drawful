import { RequestHandler, Response } from 'express';
import session, { SessionOptions } from 'express-session';

import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import connectRedis from 'connect-redis';

const wrap = (
  middleware: RequestHandler
): ((socket: Socket, fn: (err?: any) => void) => void) => {
  return (socket, next) => middleware(socket.request, {} as Response, next);
};

export function useSession(app, io, redisClient?: Redis) {
  let options: SessionOptions = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: true, secure: false },
  };

  if (redisClient) {
    const RedisStore = connectRedis(session);

    options = {
      ...options,
      store: new RedisStore({ client: redisClient }),
    };
  }

  const sesh = session(options);

  // attach session middleware to app so that cookies are set on page GETs
  app.use(sesh);

  // also attach to session middleware to make the session available on socket.request
  io.use(wrap(sesh));
}
