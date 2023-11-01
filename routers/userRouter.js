const { Router } = require('express');
const userRouter = Router();

const { signUp, verifyEmail, signIn,
    forgotPassword, resetPassword, updatePassword, logout } = require('../controllers/userControllers');

userRouter.post('/sign-up', signUp);
userRouter.post('/sign-in', signIn);
userRouter.get('/verify-email/:token', verifyEmail)
userRouter.post('/forgot-password', forgotPassword)
userRouter.get('/reset-password/:token', resetPassword)
userRouter.post('/update-password/:token', updatePassword)
userRouter.post('/update-password/:token', updatePassword)
userRouter.get('/sign-out', logout)


module.exports = {
    userRouter
}


