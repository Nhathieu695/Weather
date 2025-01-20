const admin = require("firebase-admin");
const axios = require('axios');
const serviceAccount = require('../serviceAccountKey.json');
const cron = require('node-cron')
const redisClient = require('../../redis-client');
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

                // Lấy thông tin thành phố và thời tiết từ Redis hoặc API
                const city = await getCity(lat, lng);
                const weather = await getWeather(lat, lng);

                const payload = createPayload(city, weather.current.temp_c, weather.current.condition.icon);
                let token = element.token;

                await admin.messaging().send({
                    token, // Send to the specific token
                    ...payload,
                });
            });

            await Promise.all(promises); // Đảm bảo tất cả thông báo được gửi
            res.status(200).json('Notifications sent successfully');
        } catch (error) {
            console.error("Error in sending notifications:", error);
            res.status(500).send("Error in sending notifications.");
        }
    }
};



function createPayload(cityName, Temp, icon) {
    return {
        notification: {
            title: `Weather Forecast Today of ${cityName}`,
            body: `${Temp} °C in ${cityName}`,
        },

    };
}
// Lấy thời tiết từ API
async function getWeather(lat, lng) {
    const redisKey = `weather:${lat}:${lng}`;
    const cachedWeather = await redisClient.get(redisKey);

    if (cachedWeather) {
        console.log('Using cached weather data.', cachedWeather);
        return JSON.parse(cachedWeather);
    }

    const apiKey = "35661687a52442b09db154609250301";
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?q=${lat},${lng}&key=${apiKey}`);

    if (!response || response.status !== 200) throw new Error('Failed to fetch weather data');

    const weatherData = response.data;

    // Lưu vào Redis cache với thời hạn 1 giờ
    await redisClient.set(redisKey, JSON.stringify(weatherData), { EX: 3600 });

    return weatherData;
}


// Lấy tên thành phố từ lat và lng
async function getCity(lat, lng) {
    const redisKey = `city:${lat}:${lng}`;
    const cachedCity = await redisClient.get(redisKey);

    if (cachedCity) {
        console.log('Using cached city data.', cachedCity);
        return cachedCity;
    }

    const apiKey = "21f09e30d190ad04d529df443d5dea3f";
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`);

    if (response.status !== 200) throw new Error('Failed to fetch city data');

    const cityName = response.data[0]?.name;

    // Lưu vào Redis cache với thời hạn 24 giờ
    await redisClient.set(redisKey, cityName, { EX: 86400 });

    return cityName;
}



// Lấy dữ liệu từ Firestore
async function retrieveData() {
    const redisKey = 'FCM_tokens';
    const cachedTokens = await redisClient.get(redisKey);

    if (cachedTokens) {
        console.log('Using cached token data.');
        return JSON.parse(cachedTokens);
    }

    const docRef = db.collection('FCM_tokens');
    const snapshot = await docRef.get();
    const arr = [];

    if (snapshot.empty) {
        console.log('No matching documents.');
        return arr;
    }

    snapshot.forEach(doc => {
        arr.push(doc.data());
    });

    // Lưu danh sách token vào Redis cache với thời hạn 1 giờ
    await redisClient.set(redisKey, JSON.stringify(arr), { EX: 3600 });

    return arr;
}


// Đặt lịch chạy cron job (hàng ngày vào 8:00 sáng)
cron.schedule('30 21 * * *', async () => {
    console.log("Running cron job for sending notifications...");
    await FCMNotification.notification();
});

module.exports = FCMNotification;
