const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');
const process = require('process');

const userSchema = new Schema({
    email: {
        type: String,
        trim: true,
        required: [true, "email is required"],
        validate: [isEmail, "not a valid email address"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minLength: [8, "minimum 8 character are required"]
    },
    username: {
        type: String,
        default: "anonymous",
        maxLength: [32, "maximum 32 character are allowed for username"]
    },
    verified: {
        type: Boolean,
        default: false
    },
    passwordChangedAt: {
        type: Date,
        default: this.createdAt
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        refs: "tasks"
    }]
}, {
    timestamps: true
});


userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, +process.env.SALT_ROUNDS)
    }
})

userSchema.methods.confirmPWD = async function (password, passwordDB) {
    return bcrypt.compare(password, passwordDB)
}

userSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

userSchema.methods.isPasswordChangedAt = function (iat) {
    if (this.passwordChangedAt) {
        let timeInMs = this.passwordChangedAt.getTime() / 1000;
        return timeInMs > iat

    }
    return false
}

const userModel = model("users", userSchema);

module.exports = {
    userModel
}