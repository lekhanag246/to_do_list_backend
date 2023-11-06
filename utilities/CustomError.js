class CustomError extends Error {
    constructor(errorCode, status, message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.message = message
        this.isOperational = true;
        // Error.captureStackTrace(this, this.constructor);
    }
}

module.exports.CustomError = CustomError;
