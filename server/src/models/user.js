const mongoose = require("mongoose");



const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            match: /.+\@.+\..+/
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        isSubscribed: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
