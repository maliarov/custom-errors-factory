# custom-errors-factory [![Build Status](https://travis-ci.org/mujichOk/custom-errors-factory.svg?branch=master)](https://travis-ci.org/mujichOk/custom-errors-factory)

## About

Make you errors more handy. Construct them with custom properties and templated messages. Build you own tree of errors inheritance. Use all power of types and best practicies from laguages with strong errors handling experience.

## Install

```
npm install custom-errors-factory
```

## Usage

```javascript
const errorsFactory = require('custom-errors-factory');

const EntityNotFoundError = errorsFactory('EntityNotFound', {
  message: '[${entityType}] entity not found', 
  entityType: 'Unknown'
});

const UserEntityNotFoundError = errorsFactory('UserEntityNotFound', {
  entityType: 'User'
}, EntityNotFoundError);

const TestError = errorsFactory('Test');

const EntityNotFoundError = errorsFactory('EntityNotFound', {
    message: '[${entityType}] entity not found', 
    entityType: 'Unknown'
});

const UserEntityNotFoundError = errorsFactory('UserEntityNotFound', {
    entityType: 'User'
}, EntityNotFoundError);

const AnotherCustomError = errorsFactory('CustomError');

const CustomWithInnerError = errorsFactory('CustomWithInnerError')
    .innerError(new Error('custom error'));


const customError = new UserEntityNotFoundError({someProperty: 'some additional property'});


console.log(customError instanceof Error); // true
console.log(customError instanceof EntityNotFoundError); // true
console.log(customError instanceof AnotherCustomError); // false
```

## Configuration

You can create custom errors from predefined configuration with inheritance out of box! :)

```javascript
const errorsFactory = require('custom-errors-factory');

// from config object (note: you can use it for async load from remote server, for instance)
const context = errorsFactory.createFromConfig({
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
const errorsFactory = require('custom-errors-factory');
const errorsConfiguration = require('config/errors.json');

module.exports = errorsFactory.createFromConfig(errorsConfiguration);
``` 

```javascript
// source/app.js
const {EntityNotFound} = require('./errors');

const customError = new EntityNotFound({entityType: 'File', path: '/some-path-to-file'});
```