const Subscriber = require('../models/subscriber');
const User = require('../models/user');
const Cities = require('../models/cities');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Cấu hình Mailtrap SMTP
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

const subscriberController = {
    // Đăng ký nhận thông báo
    subscribe: async (req, res) => {
        const { userId, cityId } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            const city = await Cities.findById(cityId);
            if (!city) {
                return res.status(404).json({ message: 'Thành phố không tồn tại' });
            }

            // Tạo subscriber mới
            const newSubscriber = await Subscriber.create({ userId, cityId });

            // Gửi email thông báo
            const mailOptions = {
                from: '"Weather App" <no-reply@weather.com.vn>',
                to: user.email, // Gửi đến email của người dùng
                subject: 'Đăng ký nhận thông báo thời tiết thành công',
                text: `Bạn đã đăng ký nhận thông báo thời tiết cho thành phố ${city.city}.`,
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Email đã được gửi:', info.messageId);
            } catch (error) {
                console.error('Lỗi khi gửi email:', error);
            }

            return res.status(201).json({
                message: 'Đăng ký thành công',
                data: newSubscriber,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    },

    // Hủy đăng ký nhận thông báo
    unsubscribe: async (req, res) => {
        const { userId, cityId } = req.body;

        try {
            const subscriber = await Subscriber.findOneAndDelete({ userId, cityId });
            if (!subscriber) {
                return res.status(404).json({ message: 'Đăng ký không tồn tại' });
            }

            return res.status(200).json({ message: 'Hủy đăng ký thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    },

    // Gửi thông báo thời tiết
    sendWeatherNotification: async () => {
        try {
            const subscribers = await Subscriber.find().populate('userId cityId'); // Lấy danh sách subscriber và thông tin người dùng, thành phố
            for (const subscriber of subscribers) {
                const city = subscriber.cityId; // Thành phố đã đăng ký
                const user = subscriber.userId; // Người dùng đã đăng ký

                // Lấy thông tin thời tiết từ API
                const weatherApiKey = process.env.WEATHER_API_KEY;
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${weatherApiKey}&units=metric`
                );
                const weather = response.data;

                // Gửi email thông báo thời tiết
                const mailOptions = {
                    from: '"Weather App" <no-reply@weather.com.vn>',
                    to: user.email,
                    subject: `Dự báo thời tiết cho ${city.city}`,
                    text: `Dự báo thời tiết cho ${city.city}:\nNhiệt độ: ${weather.main.temp}°C\nTrạng thái: ${weather.weather[0].description}`,
                };

                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email đã được gửi:', info.messageId);
                } catch (error) {
                    console.error('Lỗi khi gửi email:', error);
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi thông báo thời tiết:', error);
        }
    },
};

module.exports = subscriberController;
