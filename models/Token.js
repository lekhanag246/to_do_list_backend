const { model, Schema } = require('mongoose');

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        refs: "users",
        required: [true, "user_id required"],
    },
    token: {
        type: String,
        required: [true, "token required"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10
    }
}, { timestamps: true })



let tokenModel = model('tokens', TokenSchema)

module.exports.tokenModel = tokenModel