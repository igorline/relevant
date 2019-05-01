if (process.env.BROWSER === true) {
  registerServiceWorker();
}

function registerServiceWorker() {
  try {
    navigator.serviceWorker.register('/service-worker.js');
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}

export async function initPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  } catch (err) {
    console.log(err); // eslint-disable-line
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
