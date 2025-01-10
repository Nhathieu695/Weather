importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Cấu hình Firebase
firebase.initializeApp({
    apiKey: "AIzaSyAZuNnNp_DYgINRDMKLUXCpcYGD1M_tdY4",
    authDomain: "weather-a8d5f.firebaseapp.com",
    projectId: "weather-a8d5f",
    storageBucket: "weather-a8d5f.firebasestorage.app",
    messagingSenderId: "383747542029",
    appId: "1:383747542029:web:7187e7107fee6b61175944",
    measurementId: "G-QLED0X19GE",
});

const messaging = firebase.messaging();

// Xử lý thông báo khi ứng dụng ở chế độ background
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message', payload);

    const notificationTitle = payload.notification?.title || 'Background Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message!',
        icon: '/icon.png', // Thay icon tùy ý
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
