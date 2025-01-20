const router = require('express').Router();
const location = require('../controller/location');
const FCMController = require('../controller/FCMcontroller');
const FCMNotification = require('../controller/Notification');
const userController = require('../controller/userController');
const passport = require('passport');

// Route lấy thông tin vị trí
router.get('/location', location.getlocation);

// Route lưu token FCM
router.post('/FCM/token', FCMController.saveToken);

// Route đăng ký người dùng
router.post('/register', userController.register);

// Route gửi thông báo FCM
router.post('/FCM/nofication', FCMNotification.notification);

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
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.json({ message: 'Đăng xuất thành công' }); // Gửi thông báo đăng xuất
    });
});

module.exports = router;
