import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithId extends Request {
  id?: string;
}

// Assigns a correlation id to every request (honoring an inbound X-Request-Id from
// an upstream proxy when present) and echoes it on the response. Lets a user quote
// the id from an error and lets us trace one request across structured log lines.
export const requestId = (req: RequestWithId, res: Response, next: NextFunction) => {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 200
      ? incoming
      : randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
