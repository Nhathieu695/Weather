const bcrypt = require("bcrypt");
const User = require('../models/user');

const userController = {
    register: async (req, res) => {
        const { email, password } = req.body;
        try {

            const isExist = await User.findOne({ email });
            if (isExist) {
                return res.status(400).json({ message: `Email: ${email} đã tồn tại` });
            }

            const hashPass = await hashPassword(password);

            let userNew = await User.create({ email, password: hashPass });
            return res.status(201).json({
                status: "create a new user",
                data: userNew
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo người dùng." });
        }
    }
};


const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

module.exports = userController; 
