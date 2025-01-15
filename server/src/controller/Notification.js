const admin = require("firebase-admin");
const axios = require('axios');
const serviceAccount = require('../serviceAccountKey.json');
const cronjob = require('node-cron')
if (admin.apps.length === 0) {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    console.log('Firebase app has already been initialized.');
}

const db = admin.firestore();

const FCMNotification = {
    notification: async (req, res) => {
        try {
            const dataArr = await retrieveData();
            const promises = dataArr.map(async (element) => {
                const lat = element.lat;
                const lng = element.lng;
                const city = await getCity(lat, lng);
                const weather = await getWeather(lat, lng);
                const payload = createPayload(city, weather.current.temp_c, weather.current.condition.icon);

                return admin.messaging().send(payload)
                    .then((response) => {
                        // Response is a message ID string.
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error);
                    });
            });

            await Promise.all(promises);
            res.status(200).send("Notifications sent successfully.");
        } catch (error) {
            console.error("Error in sending notifications:", error);
            res.status(500).send("Error in sending notifications.");
        }
    }
}

function createPayload(cityName, Temp, icon) {
    const message = {
        notification: {
            title: `Weather Forecast Today of ${cityName}`,
            body: `${Temp} °C in ${cityName}`,
            image: `http://openweathermap.org/img/wn/${icon}.png`
        },

    };
    return message;
}

// Lấy thời tiết từ API
async function getWeather(lat, lng) {
    const apikey = "35661687a52442b09db154609250301";
    const response = await axios(`http://api.weatherapi.com/v1/current.json?q=${lat},${lng}&key=${apikey}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
}

// Lấy tên thành phố từ lat và lng
async function getCity(lat, lng) {
    const apiKey = "21f09e30d190ad04d529df443d5dea3f";
    const response = await axios(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`);
    if (!response.ok) throw new Error('Failed to fetch city data');
    const data = await response.json();
    return data[0].name; // Giả sử dữ liệu trả về là mảng và lấy tên thành phố từ phần tử đầu tiên
}

// Lấy dữ liệu từ Firestore
async function retrieveData() {
    const docRef = db.collection('FCM_tokens');
    const snapshot = await docRef.get();
    const arr = [];

    if (snapshot.empty) {
        console.log('No matching documents.');
        return arr; // Trả về mảng rỗng nếu không có tài liệu
    }

    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        arr.push(doc.data()); // Thêm tài liệu vào mảng
    });
    return arr;
}

module.exports = FCMNotification;
