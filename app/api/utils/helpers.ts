export function isLocalEnv() {
  return process.env.NODE_ENV === 'development';
}

export function getConcurrencyLimit() {
  return process.env.CONCURRENCY_LIMIT ? parseInt(process.env.CONCURRENCY_LIMIT) : 5;
}