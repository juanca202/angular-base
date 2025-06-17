importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');


// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyD5xyqCqcUXAA4yo8OcR6_tCgxz4RVu7AU",
    authDomain: "tripot-5d5c6.firebaseapp.com",
    databaseURL: "https://tripot-5d5c6-default-rtdb.firebaseio.com",
    projectId: "tripot-5d5c6",
    storageBucket: "tripot-5d5c6.appspot.com",
    messagingSenderId: "621788368517",
    appId: "1:621788368517:web:75d886e9d60d68e63a23ec",
    measurementId: "G-4Z1QWPCW6B"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    console.log(
        'Background push message: ',
        payload
    );
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon
    });
});
/*
// Enviar un mensaje a la aplicación
clients.matchAll().then(clients => {
    clients.forEach(client => {
        client.postMessage({
            type: 'NOTIFICATION_RECEIVED',
            data: payload
        });
    });
});
*/