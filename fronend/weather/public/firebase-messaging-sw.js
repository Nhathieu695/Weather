// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZuNnNp_DYgINRDMKLUXCpcYGD1M_tdY4",
    authDomain: "weather-a8d5f.firebaseapp.com",
    projectId: "weather-a8d5f",
    storageBucket: "weather-a8d5f.firebasestorage.app",
    messagingSenderId: "383747542029",
    appId: "1:383747542029:web:7187e7107fee6b61175944",
    measurementId: "G-QLED0X19GE"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Lấy instance của Firebase Messaging
const messaging = firebase.messaging();

// Xử lý thông báo khi ứng dụng đang ở chế độ nền
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', JSON.stringify(payload));

    // Tuỳ chỉnh thông báo
    const notificationTitle = payload.notification.title;
    console.log(notificationTitle);
    const notificationOptions = {
        body: payload.notification.body,
        // icon: payload.notification.image

    };

    self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('Notification shown successfully.');
        })
        .catch((err) => {
            console.error('Error showing notification:', err);
        });

});
