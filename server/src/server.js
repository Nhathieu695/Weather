const express = require('express');
const app = express();
const port = 8080;
require('dotenv').config();
const mongoose = require('mongoose');
const router = require('./router/router');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const localStrategy = require('./auth/passport/local.strategy');

const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

// Thiết lập session cho Passport
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // Thời hạn cookie: 1 ngày
        },
    })
);

// Khởi động Passport
app.use(passport.initialize());
app.use(passport.session());

// Khởi động Local Strategy
localStrategy(passport); // Sử dụng chiến lược từ file local.strategy.js

app.use('/', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const mongoURI = process.env.MONGODB_CONNECTION;
(async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();
