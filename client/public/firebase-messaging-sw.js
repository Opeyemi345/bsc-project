// Firebase Messaging Service Worker
// This file handles background notifications when the app is not in focus

let messaging = null;

try {
  // Import Firebase scripts
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  // Initialize Firebase in the service worker (only if properly configured)
  const firebaseConfig = {
    apiKey: "AIzaSyDp9NvpCGpWsaSNhGZ1w2d1kEWKd7guSCw",
    authDomain: "test-app-346ae.firebaseapp.com",
    projectId: "test-app-346ae",
    storageBucket: "test-app-346ae.firebasestorage.app",
    messagingSenderId: "282880497034",
    appId: "1:282880497034:web:fb3b4430c81c90fdcde473"
  };

  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log('Firebase messaging initialized in service worker');
} catch (error) {
  console.log('Firebase not configured in service worker - using basic push notifications:', error.message);
}

// Handle background messages (only if Firebase messaging is available)
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new message',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'oausconnect-notification',
      data: {
        url: payload.data?.url || '/',
        chatId: payload.data?.chatId,
        senderId: payload.data?.senderId
      },
      actions: [
        {
          action: 'open',
          title: 'Open Chat',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true,
      silent: false
    };

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle the click action
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push events (for custom data)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);

    // You can customize notification handling here
    const title = data.title || 'OausConnect';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Firebase messaging service worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Firebase messaging service worker activated');
  event.waitUntil(self.clients.claim());
});
