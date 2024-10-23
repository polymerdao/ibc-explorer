'use client';

export function getClientEnv(): string {
  let env: string = '';
  if (
    window.location.hostname.includes('sepolia') ||
    window.location.hostname.includes('stg') ||
    window.location.hostname.includes('localhost')) {
    env = 'sepolia';
  } else {
    env = 'mainnet';
  }

  return env;
}
