import logger from 'utils/logger';

export async function fetchRegistry() {
  let data;

  try {
    let res;

    if (process.env.GITHUB_TOKEN) {
      res = await fetch(process.env.REGISTRY_URL!, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        cache: 'no-store'
      });
    } else {
      res = await fetch(process.env.REGISTRY_URL!, { cache: 'no-store' });
    }

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
