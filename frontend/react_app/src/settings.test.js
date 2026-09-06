/**
 * Covers the API/WebSocket URL resolution in settings.js, including the
 * same-origin WebSocket derivation added when the nginx /ws/ proxy was
 * introduced.
 *
 * settings.js reads process.env at module load, so each case re-imports it
 * with a fresh module registry.
 */

const loadSettings = (nodeEnv, extraEnv = {}) => {
  let mod;
  jest.isolateModules(() => {
    const original = process.env;
    process.env = { ...original, NODE_ENV: nodeEnv, ...extraEnv };
    // eslint-disable-next-line global-require
    mod = require('./settings');
    process.env = original;
  });
  return mod;
};

describe('API_SERVER', () => {
  test('points at the local Django dev server in development', () => {
    expect(loadSettings('development').API_SERVER).toBe('http://localhost:8000');
  });

  test('uses REACT_APP_API_SERVER in production', () => {
    const s = loadSettings('production', { REACT_APP_API_SERVER: 'https://api.example.com' });
    expect(s.API_SERVER).toBe('https://api.example.com');
  });
});

describe('WS_SERVER', () => {
  test('defaults to the daphne port in development', () => {
    expect(loadSettings('development').WS_SERVER).toBe('ws://localhost:8001');
  });

  test('an explicit REACT_APP_WS_SERVER always wins', () => {
    const s = loadSettings('development', { REACT_APP_WS_SERVER: 'ws://ws.example.com' });
    expect(s.WS_SERVER).toBe('ws://ws.example.com');
  });

  test('derives ws:// from an http page in production', () => {
    // jsdom default location is http://localhost/
    const s = loadSettings('production');
    expect(s.WS_SERVER).toBe('ws://localhost');
  });
});

describe('SESSION_DURATION', () => {
  test('is five hours in milliseconds', () => {
    expect(loadSettings('development').SESSION_DURATION).toBe(5 * 3600 * 1000);
  });
});
