const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    bio: {
        type: String
    },
    profileImage: {
        data: Buffer,
        type: String
    },
    phoneNumber:{
        type:String,
    }
});

module.exports = mongoose.model('User', UserSchema);
