// pwa-handler.js

window.addEventListener('load', () => {
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

if ('registerProtocolHandler' in navigator) {
    navigator.registerProtocolHandler(
        "web+nassimspace",
        `${location.origin}/?q=%s`,
        "NassimSpace Protocol"
    );
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.querySelector('#install-pwa-btn').style.display = 'block';
});

document.querySelector('#install-pwa-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log('Install choice:', result.outcome);
        deferredPrompt = null;
    }
});

function updateOnlineStatus() {
    const offlineBanner = document.getElementById('offline-banner');
    if (!navigator.onLine) {
        offlineBanner?.classList.remove('hidden');
        console.warn("You are offline");
    } else {
        offlineBanner?.classList.add('hidden');
        console.info("You are online");
    }
}




