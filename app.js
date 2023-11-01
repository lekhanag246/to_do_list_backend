const process = require('process');
const express = require('express');
const app = express();
const cors = require('cors');

if (process.env.NODE_ENV == 'DEVELOPMENT') {
    require('dotenv').config();
}
const { connectDb } = require('./db')
const { taskRouter } = require('./routers/taskRouter');
const { userRouter } = require('./routers/userRouter');
const { errorController } = require('./middlewares/globalErrorController');
const { CustomError } = require('./utilities/CustomError');

//middleware
app.use(cors({
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs')
// FIXME COOKIE AND CORS

//routers 
app.get('/test', (req, res) => {
    res.status(200).send({
        status: "success",
        message: "test api"
    })
})

app.use('/app', taskRouter);
app.use('/app/users', userRouter);
app.all('*', (req, res, next) => {
    next(new CustomError(400, "fail", `unable to get ${req.originalUrl}`))
})

//error handler
app.use(errorController);


app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(`error creating server ${error.message}`);
    } else {
        console.log(`listening to requests on port ${process.env.PORT}`);
        connectDb();
    }
})

module.exports = app;