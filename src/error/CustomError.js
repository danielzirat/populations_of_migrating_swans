class CustomError extends Error{
    constructor(code, msg) {
        super();
        this.code = code;
        this.message = msg;
    }
}

module.exports = CustomError;