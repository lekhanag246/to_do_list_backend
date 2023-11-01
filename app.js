const process = require('process')
const express = require('express');
const app = express();
const cors = require('cors');

if (process.env.NODE_ENV == 'DEVELOPMENT') {
    require('dotenv').config();
}
const { connectDb } = require('./db')
// const { taskRouter } = require('./src/routes/taskRouter');
// const { userRouter } = require('./src/routes/userRouter');
// const { errorController } = require('./src/middlewares/globalErrorController');
// const { CustomError } = require('./src/utilities/CustomError');

//middleware

app.use(cors());
app.set('view engine', 'ejs')
// FIXME COOKIE AND CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//routers 
app.get('/test', (req, res) => {
    res.status(200).send({
        status: "success",
        message: "test api"
    })
})

// app.use('/app', taskRouter);
// app.use('/app/users', userRouter);
// app.all('*', (req, res, next) => {
// next(new CustomError(400, "fail", `unable to get ${req.originalUrl}`))
// })

//error handler
// app.use(errorController);


app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(`error creating server ${error.message}`);
    } else {
        console.log(`listening to requests on port ${process.env.PORT}`);
        connectDb();
    }
})

module.exports = app;