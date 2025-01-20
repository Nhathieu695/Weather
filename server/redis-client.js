const redis = require('redis');

const redisClient = redis.createClient({

    password: process.env.PASSWORD_REDIS,
    socket: {
        host: 'redis-13114.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 13114
    }
});


redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect()
        console.log('Connected to Redis Cloud');
    } catch (err) {
        console.log('Redis connection error: ', err);
    }
})();

module.exports = redisClient;
