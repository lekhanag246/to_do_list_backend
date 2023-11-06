const { CustomError } = require("../utilities/CustomError");

// TODO global error handler
function validationErrorHandler() {
    let errorMsg = Object.values(error.errors).map((doc) => doc.message);
    errorMsg = errorMsg.join(". ")
    return new CustomError(400, "fail", errorMsg)
}
function casteErrorHandler() {
    return new CustomError(400, "fail", "not a valid Id for this field")
}

function duplicateErrorHandler() {
    return new CustomError(400, "fail", `an account with this email already exits , try another one`)
}

const tokenError = (err) => {
    return new CustomError(400, "fail", "Invalid signature. please login again")
}

const tokenExpiredError = (err) => {
    return new CustomError(400, "fail", "session expired. please login again")
}


function errorController(error, req, res, next) {
    if (error.name == "ValidationError") {
        error = validationErrorHandler();
    }
    if (error.name == "CasteError") {
        error = casteErrorHandler();
    }
    if (error.code == 11000) {
        error = duplicateErrorHandler();
    }
    if (error.name == "JsonWebTokenError") {
        error = tokenError(error)
    }
    if (error.name == "TokenExpiredError") {
        error = tokenExpiredError(error)
    }
    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.errorCode || 500).send({
            status: error.status || "error",
            message: error.message,
            stackTrace: error.stack
        })
    }
    else {
        if (error.isOperational == true) {
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