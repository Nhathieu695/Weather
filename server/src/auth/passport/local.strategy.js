const { Strategy } = require('passport-local');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

const localStrategy = (passport) => {
    passport.use(new Strategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username });
            if (!user) {
                return done(null, false, { message: 'Tên người dùng không tồn tại.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Mật khẩu không đúng.' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};



module.exports = localStrategy;
