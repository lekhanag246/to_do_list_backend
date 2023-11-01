const bcrypt = require('bcryptjs');
const process = require('process')

const jwt = require('jsonwebtoken');

const { userModel } = require('../models/User');
const { tokenModel } = require('../models/Token');

const { generateTokenVerifyEmail, generateAccessToken } = require('../utilities/Auth')

const { asyncErrorHandler } = require('./asyncErrorHandler');
const { CustomError } = require('../utilities/CustomError');

const signUp = asyncErrorHandler(async (req, res, next) => {
    let { email, password, username } = req.body
    if (!email || !password || !username) {
        throw new CustomError(400, "fail", "username , password , email can't be empty")
    }
    let user = await userModel.create({ email, password, username });
    if (!user) {
        throw new CustomError(400, "fail", "unable to signup right now . try again .")
    }
    //send email to verify the user using crypto
    await generateTokenVerifyEmail(user._id, user.email, "email_verification")

    res.status(200).json({
        status: "success",
        message: "Successfully registered . We have sent you an email to verify your account ."
    });
})


const verifyEmail = asyncErrorHandler(async (req, res, next) => {
    let token = req.params.token;
    let tokenDB = await tokenModel.findOne({ token })
    if (!tokenDB) {
        // throw new Error("invalid token or token has expired")
        res.status(400).render('invalidToken', { action: "Sign in and we will send you another email to verify your account .Unverified account are sent a verification email when they sign in." })
    }
    await userModel.findOneAndUpdate({ _id: tokenDB.userId }, { verified: true }, { new: true });
    await tokenModel.findOneAndDelete({ userId: tokenDB.userId, token: token })

    res.status(200).render('verified')//'email id is verified . sign in to start accessing your account'
    // TODO LINK REAL SIGN-IN 
})

const signIn = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email: email })
    if (!user) {
        throw new CustomError(400, "fail", "email does not exist")
    }
    //DON'T LET UN VERIFIED USERS LOGIN
    if (user.verified == false) {
        //delete old token  if any
        await tokenModel.findOneAndDelete({ userId: user._id })
        //and create a new token and send email
        await generateTokenVerifyEmail(user._id, user.email, "email_verification");
        throw new CustomError(400, "fail", "You can't access your account without verifying . \n Unverified account are sent a verification email when they sign in. \n Please verify your account through the link we have sent.")
    }
    if (! await user.confirmPWD(password, user.password)) {
        throw new CustomError(400, "fail", "email/password is incorrect")

    }
    //send jwt token with 24hr expiry time
    //create session on browser side    
    const accessToken = generateAccessToken(user._id)
    // SEND TOKEN IN COOKIE 
    // can't access cookies that are set to httpOnly on client side 
    // httpOnly makes it secure
    res.status(200).send({
        status: "success",
        message: "signin successful",
        accessToken: accessToken
    })
})

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const { email } = req.body;
    // console.log(req.body)
    let user = await userModel.findOne({ email: email })
    // console.log(user)
    if (!user) {
        throw new CustomError(400, "fail", "incorrect email")
    }
    //delete the previous token if any token time could be < 10mins 
    await tokenModel.findOneAndDelete({ userId: user._id })
    await generateTokenVerifyEmail(user._id, user.email, "reset_password");
    res.status(200).send({
        status: "success",
        message: "reset link sent to ur email successful"
    })
})
const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.params;
    let tokenDB = await tokenModel.findOne({ token })
    if (!tokenDB) {
        // throw new Error("invalid token or token has expired")
        res.status(400).render('invalidToken', { action: "Send another forgot password request by clicking the link in the sign in page. " })
    }
    res.status(200).render("resetPassword", { token })
})

const updatePassword = asyncErrorHandler(async (req, res) => {
    let token = req.params.token
    let { password } = req.body;
    // confirmPassword

    // if (password !== confirmPassword) {
    //     throw new CustomError(400, "fail", "password and confirm password should match")
    // }
    if (!password) {
        throw new CustomError(400, "fail", "password should not be empty")
    }
    let tokenDB = await tokenModel.findOne({ token })
    let user = await userModel.findById(tokenDB.userId)
    if (!user || !tokenDB) {
        // throw new Error("invalid token or token has expired")
        res.status(400).render('invalid Token', { action: "Send another forgot password request by clicking the link in the sign in page. " })
    }

    let newUser = await userModel.updateOne({ _id: user._id }, { $set: { password: await bcrypt.hash(password, +process.env.SALT_ROUNDS), passwordChangedAt: Date.now() } }, { new: true });
    await tokenModel.findOneAndDelete({ token: token })

    res.status(200).render('updatedPwd')
    // TODO LINK REAL SIGN-IN  OR CLOSE
})

const authorize = asyncErrorHandler(async (req, res, next) => {
    //0. get refresh tokens
    // console.log(req.cookies.refreshToken)

    //1. get the token
    let accessToken = "";
    let tokenHeader = req.headers.authorization;
    if (tokenHeader && tokenHeader.startsWith('Bearer')) {
        token = tokenHeader.split(" ")[1];
    } else {
        throw new CustomError(400, 'fail', "please sign-in to access your account")
        // to developer it should be token not found
    }

    //2. verify the token 
    let decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //3. find if user exists from the _id
    let user = await userModel.findById(decodedToken._id);
    if (!user) {
        throw new CustomError(400, 'fail', "token is corrupted or token has expired ")
    }
    if (user.isPasswordChangedAt(decodedToken.iat)) {
        throw new CustomError(400, 'fail', "password was changed sign in again")
    }
    req.user = user;
    next()
})

const logout = async (req, res) => {
    try {
        res.status(200).send({ status: "success", message: "successfully logged out", accessToken: "" })
    } catch (error) {
        res.status(200).send({ status: "fail", message: "error logging out" })
    }
}
module.exports = {
    signUp: signUp,
    verifyEmail: verifyEmail,
    signIn: signIn,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    updatePassword: updatePassword,
    authorize: authorize,
    logout: logout
};
