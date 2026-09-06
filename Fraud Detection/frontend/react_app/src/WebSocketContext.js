import React, { createContext, useState, useEffect } from 'react';
import * as settings from './settings';

export const WebSocketContext = createContext(null);

// Cap on how many messages we retain per stream. The dashboard only ever
// renders recent activity, but these lists are persisted to localStorage and
// used to grow without bound across sessions.
const MAX_HISTORY = 500;
const MAX_RECENT = 5;

// localStorage throws in private windows and when site data is blocked, so
// every access is guarded and degrades to an empty list.
const loadPersisted = (key) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    } catch (err) {
        return [];
    }
};

const persist = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        /* quota exceeded or storage unavailable -- state still lives in memory */
    }
};

export const WebSocketProvider = ({ children }) => {
    const [allTransactions, setAllTransactions] = useState(() => loadPersisted('allTransactions'));
    const [recentTransactions, setRecentTransactions] = useState(() => loadPersisted('recentTransactions'));
    const [allAlerts, setAllAlerts] = useState(() => loadPersisted('allAlerts'));
    const [alerts, setAlerts] = useState(() => loadPersisted('alerts'));
    const [activities, setActivities] = useState(() => loadPersisted('activities'));
    const [allRatings, setAllRatings] = useState(() => loadPersisted('allRatings'));

    useEffect(() => {
        // settings.WS_SERVER is the daphne port locally and the same origin
        // (proxied by nginx) in production -- see src/settings.js.
        const base = settings.WS_SERVER;

        const transactionSocket = new WebSocket(`${base}/ws/transactions/`);
        const alertSocket = new WebSocket(`${base}/ws/alerts/`);
        const activitySocket = new WebSocket(`${base}/ws/user-activity/`);
        const ratingSocket = new WebSocket(`${base}/ws/ratings/`);

        // Appends to a capped history list and persists it.
        const appendCapped = (setter, key) => (item) => {
            setter((prev) => {
                const updated = [...prev, item].slice(-MAX_HISTORY);
                persist(key, updated);
                return updated;
            });
        };

        const appendTransaction = appendCapped(setAllTransactions, 'allTransactions');
        const appendAlert = appendCapped(setAllAlerts, 'allAlerts');
        const appendActivity = appendCapped(setActivities, 'activities');
        const appendRating = appendCapped(setAllRatings, 'allRatings');

        transactionSocket.onmessage = (event) => {
            const newTransaction = JSON.parse(event.data);
            appendTransaction(newTransaction);

            setRecentTransactions((prev) => {
                const updated = [newTransaction, ...prev].slice(0, MAX_RECENT);
                persist('recentTransactions', updated);
                return updated;
            });
        };

        alertSocket.onmessage = (event) => {
            const newAlert = JSON.parse(event.data);
            appendAlert(newAlert);

            setAlerts((prev) => {
                const updated = [newAlert, ...prev].slice(0, MAX_RECENT);
                persist('alerts', updated);
                return updated;
            });
        };

        activitySocket.onmessage = (event) => {
            appendActivity(JSON.parse(event.data));
        };

        ratingSocket.onmessage = (event) => {
            appendRating(JSON.parse(event.data));
        };

        const sockets = {
            transaction: transactionSocket,
            alert: alertSocket,
            activity: activitySocket,
            rating: ratingSocket,
        };

        Object.entries(sockets).forEach(([name, socket]) => {
            socket.onerror = () => {
                console.error(`${name} WebSocket error -- is daphne running on ${base}?`);
            };
        });

        return () => {
            Object.values(sockets).forEach((socket) => socket.close());
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ allTransactions, recentTransactions, alerts, allAlerts, activities, allRatings }}>
            {children}
        </WebSocketContext.Provider>
    );
};
