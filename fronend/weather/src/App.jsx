import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";
import axios from 'axios';
import { useUser } from '../usercontext.jsx';

const firebaseConfig = {
  apiKey: "AIzaSyAZuNnNp_DYgINRDMKLUXCpcYGD1M_tdY4",
  authDomain: "weather-a8d5f.firebaseapp.com",
  projectId: "weather-a8d5f",
  storageBucket: "weather-a8d5f.firebasestorage.app",
  messagingSenderId: "383747542029",
  appId: "1:383747542029:web:7187e7107fee6b61175944",
  measurementId: "G-QLED0X19GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function App() {
  const { setUser } = useUser();

  useEffect(() => {
    requestPermission();

    // Đọc thông tin người dùng từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Lấy thông tin từ localStorage
    }

    // Đăng ký Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [setUser]); // Chỉ chạy lại khi setUser thay đổi

  return (
    <>
      <Outlet />
    </>
  );
}

function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      getFCMToken();
    }
  });
}

async function getFCMToken() {
  const messaging = getMessaging(app);
  await getToken(messaging, { vapidKey: 'BBVw62MzPZzjgPqBQsrm3NvOkFTdJphhvDrkjC-9Gtze-ylHBrT0_rlDAAcAX-f0N01dbMrv3fZcgcVuMEXWfsg' })
    .then(async (currentToken) => {
      if (currentToken) {
        const { lat, lng } = await getCurrentLocation();

        // Gửi dữ liệu lên server
        const response = await axios.post('http://localhost:8080/FCM/token', {
          token: currentToken,
          lat,
          lng,
        });
        console.log("token", currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
}

async function getCurrentLocation() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0,
      });
    });

    const { latitude: lat, longitude: lng } = position.coords;
    return { lat, lng };
  } catch (error) {
    let message = "An error occurred while retrieving location.";
    if (error.code === 1) message = "Permission denied by user.";
    if (error.code === 2) message = "Position unavailable.";
    if (error.code === 3) message = "Timeout while retrieving location.";
    throw new Error(message);
  }
}

export default App;
