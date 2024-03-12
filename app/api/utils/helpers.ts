export function isLocalEnv() {
  return process.env.NODE_ENV === 'development';
}