import * as Sentry from '@sentry/react';

function initSentry() {
    try {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            integrations: [new Sentry.Replay()],
            // Performance Monitoring
            tracesSampleRate: 1.0, // Capture 100% of the transactions
            // Session Replay
            replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
            replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
        });
    } catch (err) {
        console.error('Sentry initialization failed:', err);
    }
}

export { initSentry };
