const bcrypt = require("bcrypt");
const User = require('../models/user');

const userController = {
    register: async (req, res) => {
        const { email, password, confirmpassword } = req.body;
        try {
            // Kiểm tra xem email đã tồn tại chưa
            const isExist = await User.findOne({ email });
            if (isExist) {
                return res.status(400).json({ message: `Email: ${email} đã tồn tại` });
            }

            // Kiểm tra xem mật khẩu có khớp không
            if (password !== confirmpassword) {
                return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });
            }

            // Băm mật khẩu
            const hashPass = await hashPassword(password);

            // Tạo người dùng mới
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

// Hàm băm mật khẩu
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

module.exports = userController;
