// TODO global error handler
function errorController(error, req, res, next) {
    if (error.name == "ValidationError") {
        let errorMsg = Object.values(error.errors).map((doc) => doc.message);
        errorMsg = errorMsg.join(" .")
        error.errorCode = 400;
        error.status = "fail";
        error.message = errorMsg;
        error.isOperational = true;
    }
    if (error.name == "CastError") {
        error.errorCode = 400;
        error.status = "fail";
        error.message = "not a valid Id for this field";
        error.isOperational = true;
    }
    if (error.code == 11000) {
        error.errorCode = 400;
        error.status = "fail";
        error.message = `a data with this name is already present , please try again`;
        error.isOperational = true;
    }

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.errorCode || 500).send({
            status: error.status || "error",
            message: error.message || "something went wrong",
            stackTrace: error.stack
        })
    } else {
        if (error.isOperational) {
            res.status(error.errorCode).send({
                status: error.status,
                message: error.message
            })
        } else {
            res.status(500).send({
                status: "error",
                message: "Something went wrong. Please try again."
            })
        }
    }

}



module.exports.errorController = errorController;