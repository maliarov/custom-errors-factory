const assert = require('assert');
const fs = require('fs');
const path = require('path');

const defaultErrorFilePath = process.env.CUSTOM_ERRORS_FACTORY__DEFINITION_FILE_PATH || '.errors.json';
const typeNameMatcher = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

module.exports = ErrorFactory;

if (process.env.CUSTOM_ERRORS_FACTORY__ENABLE_DEFINITION_FILE_LOAD === 'true') {
    if (fs.existsSync(defaultErrorFilePath)) {
        Object.assign(module.exports, loadFromFile(defaultErrorFilePath));
    }
}


ErrorFactory.loadFromFile = loadFromFile;
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

function loadFromFile(filePath) {
    return createFromConfig(JSON.parse(fs.readFileSync(path.join(process.cwd(), filePath))));
}

function createFromConfig(data) {
    return Object.keys(data).reduce((context, key) => {
        context[key] = ErrorFactory(key, data[key]);
        return context;
    }, {});
}