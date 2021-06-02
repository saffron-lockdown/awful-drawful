import debug from 'debug';
import { wrapCallSite } from 'source-map-support';

const APP_PREFIX = 'app';

export type Logger = debug.Debugger;

export const createLogger = (id?: string) => {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (err, stack) => stack.map(wrapCallSite);
  const callSite = new Error().stack?.[1];
  // @ts-ignore TODO: fix this
  const path = callSite.getFileName().replace('.js', '').split('/');
  Error.prepareStackTrace = orig;

  const index = path.findIndex((part) => part === 'index');
  const location =
    index === -1 ? path[path.length - 1] : path.slice(index - 1).join('/');
  const log = [APP_PREFIX, location, id].filter((x) => !!x).join(':');
  return debug(log);
};
