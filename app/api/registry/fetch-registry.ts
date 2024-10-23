import logger from 'utils/logger';

export async function fetchRegistry() {
  let data;

  try {
    const REGISTRY_URL = process.env.REGISTRY_URL;
    if (!REGISTRY_URL) {
      throw new Error('REGISTRY_URL environment variable is not set');
    }

    const fetchOptions: RequestInit = {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: process.env.GITHUB_TOKEN
        ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
        : undefined,
    };
    const res = await fetch(REGISTRY_URL, fetchOptions);

    if (!res.ok) {
      logger.error('Error from polymer-registry call: ' + res.statusText);
      return {};
    }
    data = await res.json();
  }
  catch (error) {
    logger.error('Error fetching polymer-registry: ' + error);
    return {};
  }

  return data;
}
