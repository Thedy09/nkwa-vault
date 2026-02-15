const explicitApiUrl = (process.env.REACT_APP_API_URL || '').trim();

function stripTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isLocalDevelopmentHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export const API_BASE_URL = explicitApiUrl
  ? stripTrailingSlash(explicitApiUrl)
  : (isLocalDevelopmentHost() ? 'http://localhost:4000' : '');
