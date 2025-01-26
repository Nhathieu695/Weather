const router = require('express').Router();
const location = require('../controller/location');
const FCMController = require('../controller/FCMcontroller');
const FCMNotification = require('../controller/Notification');
const userController = require('../controller/userController');
const passport = require('passport');
const subscriberController = require('../controller/subscriberController');
const cityController = require('../controller/cityController')
// Route lấy thông tin vị trí
router.get('/location', location.getlocation);

// Route lưu token FCM
router.post('/FCM/token', FCMController.saveToken);

// Route đăng ký người dùng
router.post('/register', userController.register);

// Route gửi thông báo FCM
router.post('/FCM/nofication', FCMNotification.notification);

// Route đăng ký
router.post('/subscribe', subscriberController.subscribe);

// Route hủy đăng ký
router.post('/unsubscribe', subscriberController.unsubscribe);

// Route list cities
router.get('/listcities', cityController.findAll);

// Route gửi mail
router.post('/send-weather-notifications', async (req, res) => {
    try {
        await subscriberController.sendWeatherNotification();
        res.status(200).json({ message: 'Thông báo thời tiết đã được gửi thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});


// Route đăng nhập người dùng
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: 'Đăng nhập thành công', user });
        });
    })(req, res, next);
});

// Route đăng xuất
router.get('/logout', (req, res) => {
    console.log("Đang thực hiện yêu cầu đăng xuất...");
    req.logout((err) => {
        if (err) {
            console.error("Lỗi khi logout:", err);
            return res.status(500).json({ error: 'Có lỗi xảy ra khi đăng xuất.' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error("Lỗi khi xóa session:", err);
                return res.status(500).json({ error: 'Có lỗi xảy ra khi xóa session.' });
            }
            res.clearCookie('connect.sid'); // Xóa cookie session
            res.json({ message: 'Đăng xuất thành công' });
        });
    });
});


module.exports = router;
