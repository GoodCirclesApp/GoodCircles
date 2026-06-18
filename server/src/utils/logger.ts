// Minimal structured (JSON) logger. Emits one JSON object per line so logs are
// machine-parseable in Railway / any aggregator, while staying dependency-free.
// Not a wholesale replacement for the existing console.* calls — adopt it on new
// code and hot paths (e.g. the central error handler) and migrate incrementally.

type Level = 'info' | 'warn' | 'error';

export interface LogMeta {
  [key: string]: unknown;
}

function emit(level: Level, msg: string, meta?: LogMeta): void {
  const entry: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(meta ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => emit('info', msg, meta),
  warn: (msg: string, meta?: LogMeta) => emit('warn', msg, meta),
  error: (msg: string, meta?: LogMeta) => emit('error', msg, meta),
};
