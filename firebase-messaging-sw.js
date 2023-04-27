importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyB9YOZ8hPLZVfqB9JvE9wHYl62fPHVh8Aw",
    authDomain: "textz-be8a0.firebaseapp.com",
    projectId: "textz-be8a0",
    storageBucket: "textz-be8a0.appspot.com",
    messagingSenderId: "487168414889",
    appId: "1:487168414889:web:c40e35b8d98ca2f2dbc5b8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});