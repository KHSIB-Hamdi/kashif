// ---------------------------------------------------------------------------
// REST API base URL
// ---------------------------------------------------------------------------
let API_SERVER_VAL = '';

switch (process.env.NODE_ENV) {
    case 'development':
        API_SERVER_VAL = 'http://localhost:8000';
        break;
    case 'production':
        API_SERVER_VAL = process.env.REACT_APP_API_SERVER;
        break;
    default:
        API_SERVER_VAL = 'http://localhost:8000';
        break;
}

export const API_SERVER = API_SERVER_VAL;

// ---------------------------------------------------------------------------
// WebSocket base URL
//
// Locally the ASGI server (daphne) runs on its own port, so we talk to it
// directly. In production nginx proxies /ws/ to daphne on the same origin, so
// we derive the URL from the page itself unless REACT_APP_WS_SERVER overrides
// it. Deriving keeps ws/wss in step with http/https.
// ---------------------------------------------------------------------------
const sameOriginWebSocketBase = () => {
    if (typeof window === 'undefined') return 'ws://localhost:8001';
    const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${scheme}//${window.location.host}`;
};

let WS_SERVER_VAL = '';

switch (process.env.NODE_ENV) {
    case 'development':
        WS_SERVER_VAL = process.env.REACT_APP_WS_SERVER || 'ws://localhost:8001';
        break;
    case 'production':
        WS_SERVER_VAL = process.env.REACT_APP_WS_SERVER || sameOriginWebSocketBase();
        break;
    default:
        WS_SERVER_VAL = process.env.REACT_APP_WS_SERVER || 'ws://localhost:8001';
        break;
}

export const WS_SERVER = WS_SERVER_VAL;

export const SESSION_DURATION = 5*3600*1000;
