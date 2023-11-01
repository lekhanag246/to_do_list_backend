// TODO global error handler
function errorController(error, req, res, next) {
    error.errorCode = error.errorCode || 500;

    error.status = error.errorCode >= 400 && error.errorCode <= 499 ? "fail" : "error";
    if (error.name == "ValidationError") {
        let errorMsg = Object.values(error.errors).map((doc) => doc.message);
        errorMsg = errorMsg.join(" .")
        error.errorCode = 400;
        error.message = errorMsg;
    }
    if (error.name == "CastError") {
        error.errorCode = 400;
        error.message = "not a valid Id for this field";
    }
    if (error.code == 1100) {
        error.errorCode = 400;
        error.message = `a data with this name is already present , please try again`;
    }

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.errorCode).send({
            status: error.status,
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
            res.status(error.errorCode).send({
                status: error.status,
                message: "Something went wrong. Please try again."
            })
        }
    }

}



module.exports.errorController = errorController;