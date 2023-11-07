const jwt = require('jsonwebtoken');
const { emailUser } = require('./email');
const crypto = require('crypto')
const maxAge = 30 * 60;
const { tokenModel } = require('../models/Token');
const { CustomError } = require('./CustomError');

function emailContent(token, type) {
    switch (type) {
        case "email_verification":
            return ({
                subject: "email address verification",
                // link: `http://localhost:4000/app/users/verify-email/${token}`,
                link: `https://to-do-list-v2-640k.onrender.com/app/users/verify-email/${token}`,
                filename: "verifyEmail.ejs"
            })
        case "reset_password":
            return ({
                subject: "forgot password",
                // link: `http://localhost:4000/app/users/reset-password/${token}`,
                link: `https://to-do-list-v2-640k.onrender.com/app/users/reset-password/${token}`,
                filename: "forgotPasswordEmail.ejs"
            })
        default:
            return;
    }
}

const generateTokenVerifyEmail = async (id, email, type) => {
    let token = await tokenModel.create({ userId: id, token: crypto.randomBytes(32).toString('hex') })
    emailUser(email, emailContent(token.token, type))
}

const generateAccessToken = (_id) => {
    let token = jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge });
    return token;
}



module.exports = {
    generateTokenVerifyEmail,
    generateAccessToken,
    maxAge
}