export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function classLogic(func: () => string): string {
  return func();
}

export function numberWithCommas(input: number): string {
  return input.toLocaleString('en');
}

function getClientEnv(): string {
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

export async function getExplorerFromRegistry(chainName: string): Promise<string> {
  const env = getClientEnv();

  const registryRes = await fetch(`/api/registry?chain=${chainName}&info=explorerUrl&env=${env}`,
    { cache: 'no-store' });

  if (!registryRes.ok) { return ''; }
  const registryData = await registryRes.json();
  if (registryData.error) { return ''; }

  return registryData.explorerUrl;
}
