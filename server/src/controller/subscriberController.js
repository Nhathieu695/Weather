const Subscriber = require('../models/subscriber');
const User = require('../models/user');
const Cities = require('../models/cities');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
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
            const subscribers = await Subscriber.find().populate('userId cityId');
            const userNotifications = {};

            for (const subscriber of subscribers) {
                const city = subscriber.cityId;
                const user = subscriber.userId;

                if (!userNotifications[user._id]) {
                    userNotifications[user._id] = [];
                }

                // Lấy thông tin thời tiết từ API
                const weatherApiKey = process.env.WEATHER_API_KEY;
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${weatherApiKey}&units=metric`
                );
                const weather = response.data;

                // Thêm thông báo vào danh sách của người dùng
                userNotifications[user._id].push({
                    city: city.city,
                    temperature: weather.main.temp,
                    description: weather.weather[0].description,
                });
            }

            // Gửi email cho từng người dùng
            for (const userId in userNotifications) {
                const user = await User.findById(userId);
                const notifications = userNotifications[userId];

                const mailOptions = {
                    from: '"Weather App" <no-reply@weather.com.vn>',
                    to: user.email,
                    subject: 'Dự báo thời tiết cho các thành phố bạn đã đăng ký',
                    text: notifications.map(n => `Dự báo thời tiết cho ${n.city}:\nNhiệt độ: ${n.temperature}°C\nTrạng thái: ${n.description}`).join('\n\n'),
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


    // Lấy thông tin đăng ký
    // Lấy tất cả đăng ký của một người dùng
    getAllSubscriptionsByUserId: async (req, res) => {
        const { userId } = req.params;

        // Kiểm tra xem userId có tồn tại và hợp lệ không
        if (!userId) {
            return res.status(400).json({ message: 'userId không hợp lệ' });
        }

        try {
            const subscriptions = await Subscriber.find({ userId }).populate('cityId');

            // Kiểm tra xem có đăng ký nào không
            if (subscriptions.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy đăng ký nào cho người dùng này' });
            }

            return res.status(200).json(subscriptions);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

}

cron.schedule('0 20 * * 6', () => {
    console.log('Gửi thông báo thời tiết vào 8h tối thứ Bảy');
    subscriberController.sendWeatherNotification();
});

module.exports = subscriberController;
