const mongoose = require('mongoose');
const process = require('process')
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_ATLAS);
        console.log("successfully connected db")
    } catch (error) {
        // TODO SEND A ERROR MESSAGE WHEN WE CAN'T CONNECT TO DB
        // throw new CustomError(500, "error", //internal error - db)
        console.log("error connecting to db", error.message)
    }

}

module.exports = {
    connectDb
}

