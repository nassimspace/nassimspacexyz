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




