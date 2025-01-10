const router = require('express').Router();
const location = require('../controller/location')
const FCMController = require('../controller/FCMcontroller')
const FCMNotification = require('../controller/Notification')
router.get('/location', location.getlocation)
router.post('/FCM/token', FCMController.saveToken)
router.post('/FCM/nofication', FCMNotification.notification)
module.exports = router;