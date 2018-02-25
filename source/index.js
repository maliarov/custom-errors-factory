const assert = require('assert');

const typeNameMatcher = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

module.exports = ErrorFactory;


ErrorFactory.createFromConfig = createFromConfig;

function ErrorFactory(typeName, options = {}, BaseErrorType = Error) {
    assert(typeName, 'name of custom error type must be defined');
    assert(typeNameMatcher.test(typeName), 'name of custom error type must have same pattern as JavaScript variable name');
    assert(BaseErrorType === Error || BaseErrorType.prototype instanceof Error, 'BaseErrorType must be inherited from Error');

    CustomError.prototype = Object.create(BaseErrorType.prototype);
    
    return CustomError;


    function CustomError(opts = {}) {
        BaseErrorType.call(this);

        Object.assign(this, options, opts, {
            name: typeName,
            innerError: (innerError) => {
                this.innerError = innerError;
                return this;
            }
        });

        if (BaseErrorType === Error) {
            if (this.message) {
                const message = this.message;

                Object.defineProperty(this, 'message', {
                    get: () => message.replace(/\$\{[^\}]*\}/g, (match) => this[match.slice(2, -1)] || match)
                });
            }

            Error.captureStackTrace(this, CustomError);
        }
    }
}

function createFromConfig(data) {
    const context = {};

    Object.keys(data).forEach((key) => {
        context[key] = context[key] || createError(key, data[key]);
    });

    return context;


    function createError(key, meta) {
        let baseType;

        if (meta.base) {
            if (context[meta.base]) {
                base = context[meta.base];
            } else if (data[meta.base]) {
                base = createError(meta.base, data[meta.base])
            } else {
                throw new Error(`Unknown [${meta.base}] base type`);
            }
        }

        return context[key] = ErrorFactory(key, meta, baseType);
    }
}

