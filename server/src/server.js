const express = require('express')
const app = express()
const port = 8080
require('dotenv').config()
const mongoose = require('mongoose');
const router = require('./router/router');
const cors = require('cors')
const bodyParser = require('body-parser')
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],

};
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors(corsOptions));
app.use('/', router);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const mongoURI = process.env.MONGODB_CONNECTION;
(async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();