const readonlyKeys = {
    'name': true,
    'message': true
};

module.exports = ErrorFactory;


function ErrorFactory(type, options = {}, BaseErrorType = Error) {
    CustomError.prototype = Object.create(BaseErrorType.prototype);
    return CustomError;


    function CustomError(opts = {}) {
        opts = Object.assign({}, options, opts, { name: type });
        Object.assign(this, opts);

        if (this.message) {
            this.message = this.message.replace(/\$\{[^\}]*\}/g, (match) => {
                const key = match.slice(2, -1);
                const value = opts[key];
                !readonlyKeys[key] && delete this[key];
                return value;
            });
        }

        BaseErrorType.call(this, opts);
        this.name = type;
        Error.captureStackTrace(this, CustomError);
    }
}