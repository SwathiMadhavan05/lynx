// firebase-messaging-sw.js
// This service worker handles background FCM push notifications.
// It MUST be at the root /public/ directory so the browser can register it at scope "/"

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker using the same config
firebase.initializeApp({
  apiKey: "AIzaSyBuBS3W_dpUJXth9cLmO4ktzM303x0cBmM",
  authDomain: "lynx-76cfa.firebaseapp.com",
  databaseURL: "https://lynx-76cfa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lynx-76cfa",
  storageBucket: "lynx-76cfa.firebasestorage.app",
  messagingSenderId: "972315884630",
  appId: "1:972315884630:web:2a27ddb5ed043968500ff7",
  measurementId: "G-VT7EZKP9N1"
});

const messaging = firebase.messaging();

// Handle background messages (tab not focused or browser minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const { title, body } = payload.notification || {};
  const { incidentId, floor, zone } = payload.data || {};

  const notificationTitle = title || '⚠ LYNX HIGH ALERT';
  const notificationOptions = {
    body: body || 'A critical incident has been detected.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: incidentId || 'lynx-alert',   // Collapse duplicate alerts for same incident
    renotify: true,
    requireInteraction: true,           // Forces the notification to stay until dismissed
    data: { incidentId, floor, zone, url: '/' },
    actions: [
      { action: 'view', title: 'View Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open or focus the Lynx tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a Lynx tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
