import { useEffect, useState } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowButton(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('App installed');
            }
            setDeferredPrompt(null);
            setShowButton(false);
        });
    };

    if (!showButton) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex justify-end">
            <button
                type="button"
                onClick={handleInstall}
                className="group flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-primary-600/30 ring-1 ring-primary-500/50 transition hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900"
                aria-label="Install app"
            >
                <svg
                    className="size-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                </svg>
                <span>Install App</span>
            </button>
        </div>
    );
}
