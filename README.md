# custom-errors-factory [![Build Status](https://travis-ci.org/mujichOk/custom-errors-factory.svg?branch=master)](https://travis-ci.org/mujichOk/custom-errors-factory)

Construct custom error type

## Examples
```javascript
const customErrorsFactory = require('custom-errors-factory');

const EntityNotFoundError = customErrorsFactory('EntityNotFound', {
  message: '[${entityType}] entity not found', 
  entityType: 'Unknown'
});

const UserEntityNotFoundError = customErrorsFactory('UserEntityNotFound', {
  entityType: 'User'
}, EntityNotFoundError);

const TestError = customErrorsFactory('Test');

const EntityNotFoundError = customErrorsFactory('EntityNotFound', {
    message: '[${entityType}] entity not found', 
    entityType: 'Unknown'
});

const UserEntityNotFoundError = customErrorsFactory('UserEntityNotFound', {
    entityType: 'User'
}, EntityNotFoundError);

const AnotherCustomError = customErrorsFactory('CustomError');

const CustomWithInnerError = customErrorsFactory('CustomWithInnerError')
    .innerError(new Error('custom error'));


const customError = new UserEntityNotFoundError({someProperty: 'some additional property'});


console.log(customError instanceof Error); // true
console.log(customError instanceof EntityNotFoundError); // true
console.log(customError instanceof AnotherCustomError); // false
```

## Configuration

You can create custom errors from predefined configuration with inheritance out of box! :)

```javascript
const customErrorsFactory = require('custom-errors-factory');

// from config object (note: you can use it for async load from remote server, for instance)
const context = customErrorsFactory.createFromConfig({
    BadRequest: {
        base: 'HttpError',
        message: 'Bad Request',
        code: 400
    },
    EntityNotFound: {
        message: '[${entityType}] Entity Not Found'
    },
    HttpError: {
        base: 'Error',
        message: 'HttpError',
        code: 0
    },
    Error: {
        message: 'Error'
    }
});
``` 

Load custom errors configuration and use it like:

```json
// config/errors.json
{
    "NotFound": {
        "message": "Not Found",
        "code": 404
    },
    "EntityNotFound": {
        "message": "[${entityType}] Entity Not Found"
    }
}
```

```javascript
// source/errors.js
const customErrorsFactory = require('custom-errors-factory');
// read from config json file
const customErrorsConfiguration = require('config/errors.json');

module.exports = customErrorsFactory.createFromConfig(customErrorsConfiguration);
``` 

```javascript
// source/app.js
const errors = require('./errors');

const customError = new errors.EntityNotFound({entityType: 'File', path: '/some-path-to-file'});
```