const mongoose = require('mongoose');

// Schema cho Subscriber
const SubscriberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cities',
        required: true
    }
}, {
    timestamps: true
});

// Tạo model
const Subscriber = mongoose.model('Subscriber', SubscriberSchema, 'Subscribers');

module.exports = Subscriber;
